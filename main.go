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

func voiceStateUpdate(s *discordgo.Session, m *discordgo.VoiceStateUpdate) {
    user, err := s.User(m.UserID)
    if err != nil {
        log.Error("error getting user,", "err", err)
        return
    }

    switch {
    // Caso in cui l'utente si unisce per la prima volta a un canale vocale
    case m.BeforeUpdate == nil && m.ChannelID != "":
        log.Debug(fmt.Sprintf("%s has joined the channel %s", user.Username, m.ChannelID))
        handleUserJoinedChannel(s, m.ChannelID, user)
    
    // Caso in cui l'utente lascia il canale (m.ChannelID è "")
    case m.ChannelID == "" && m.BeforeUpdate != nil:
        log.Debug(fmt.Sprintf("%s has left the channel %s", user.Username, m.BeforeUpdate.ChannelID))
        handleUserLeftChannel(s, m.BeforeUpdate.ChannelID, user)
    
    // Caso in cui l'utente cambia canale vocale
    case m.BeforeUpdate != nil && m.ChannelID != m.BeforeUpdate.ChannelID:
        log.Debug(fmt.Sprintf("%s changed channel from %s to channel %s", user.Username, m.BeforeUpdate.ChannelID, m.ChannelID))
        
        // Prima gestiamo l'uscita dal vecchio canale
        handleUserLeftChannel(s, m.BeforeUpdate.ChannelID, user)
        
        // Poi gestiamo l'entrata nel nuovo canale
        handleUserJoinedChannel(s, m.ChannelID, user)

    // Caso in cui l'utente non cambia canale, ma cambia stato mute/deaf
    case m.ChannelID == m.BeforeUpdate.ChannelID:
        if m.SelfMute != m.BeforeUpdate.SelfMute {
            if m.SelfMute {
                log.Debug(fmt.Sprintf("%s turned mute on", user.Username))
            } else {
                log.Debug(fmt.Sprintf("%s turned mute off", user.Username))
            }
        }
        if m.SelfDeaf != m.BeforeUpdate.SelfDeaf {
            if m.SelfDeaf {
                log.Debug(fmt.Sprintf("%s turned deaf on", user.Username))
            } else {
                log.Debug(fmt.Sprintf("%s turned deaf off", user.Username))
            }
        }
    }
}

func handleUserJoinedChannel(s *discordgo.Session, channelID string, user *discordgo.User) {
    // log.Info(fmt.Sprintf("Handle user %s joining channel %s", user.Username, channelID))
    // Aggiungi qui la logica
}

func handleUserLeftChannel(s *discordgo.Session, channelID string, user *discordgo.User) {
    // log.Info(fmt.Sprintf("Handle user %s leaving channel %s", user.Username, channelID))
    // Aggiungi qui la logica
}
