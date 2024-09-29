package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/charmbracelet/log"
)

var (
	Token string
	LogLevel string
)

func init() {
	flag.StringVar(&Token, "t", "", "Bot Token")
	flag.StringVar(&LogLevel, "log", "info", "Log Level of logger. Valid levels are: debug, info, warn, error, fatal")
	flag.Parse()

	validLogLevels := map[string]bool{
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
		"fatal": true,
	}

	if !validLogLevels[LogLevel] {
		log.Fatal("Invalid log level provided. Valid levels are: debug, info, warn, error, fatal")
	}
}

func main() {

	if Token == "" {
		log.Fatal("No token provided. Please run with param \"-t <bot token>\"")
		return
	}

	level, err := log.ParseLevel(LogLevel)
	if err != nil {
		log.Fatal("error parsing log level,", "err", err)
		return
	}
	log.SetLevel(level)

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