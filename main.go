package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"strconv"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/charmbracelet/log"
)

type LogLevelType struct {
    level log.Level
}

// Implement the Set method for LogLevelType
func (l *LogLevelType) Set(value string) error {
    v, err := strconv.Atoi(value)
    if err != nil {
        return err
    }
    l.level = log.Level(v)
    return nil
}

// Implement the String method for LogLevelType
func (l *LogLevelType) String() string {
    return strconv.Itoa(int(l.level))
}

var (
	Token string
	LogLevel LogLevelType
)

func init() {
	flag.StringVar(&Token, "t", "", "Bot Token")
	flag.Var(&LogLevel, "l", "Log level")
	flag.Parse()
}

func main() {

	if Token == "" {
		log.Fatal("No token provided. Please run with param \"-t <bot token>\"")
		return
	}

	log.SetLevel(LogLevel.level)

	dg, err := discordgo.New("Bot " + Token)
	if err != nil {
		log.Fatal("error creating Discord session,", "err", err)
		return
	}

	dg.AddHandler(func(s *discordgo.Session, event *discordgo.Ready) {
		log.Info(fmt.Sprintf("%s bot is ready", s.State.User))
	})

	// Register the messageCreate func as a callback for MessageCreate events.
	dg.AddHandler(messageCreate)

	dg.Identify.Intents = discordgo.IntentsGuildMessages

	// Open a websocket connection to Discord and begin listening.
	err = dg.Open()
	if err != nil {
		log.Error("error opening connection,", err)
		return
	}

	// Wait here until CTRL-C or other term signal is received.
	log.Info("Bot is now running.  Press CTRL-C to exit.")
	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc

	// Cleanly close down the Discord session.
	dg.Close()
}

func messageCreate(s *discordgo.Session, m *discordgo.MessageCreate) {

	if m.Author.ID == s.State.User.ID {
		return
	}

	if m.Content == "ping" {
		s.ChannelMessageSend(m.ChannelID, "Pong!")
	}

	if m.Content == "pong" {
		s.ChannelMessageSend(m.ChannelID, "Ping!")
	}
}