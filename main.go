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

	if Token == "" {
		log.Fatal("No token provided. Please run with param \"-t <bot token>\"")
		return
	}

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

	level, err := log.ParseLevel(LogLevel)
	if err != nil {
		log.Fatal("error parsing log level,", "err", err)
		return
	}
	log.SetLevel(level)
	log.SetTimeFormat("2006-01-02 15:04:05.000")
}

func main() {

	dg, err := discordgo.New("Bot " + Token)
	if err != nil {
		log.Fatal("error creating Discord session,", "err", err)
		return
	}

	dg.AddHandler(func(s *discordgo.Session, event *discordgo.Ready) {
		log.Info(fmt.Sprintf("%s bot is ready", s.State.User))
	})

	dg.AddHandler(messageCreate)
	dg.AddHandler(voiceStateUpdate)


	dg.Identify.Intents = discordgo.IntentsGuildMessages | discordgo.IntentsGuilds | discordgo.IntentsGuildVoiceStates

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

	dg.Close()
}
