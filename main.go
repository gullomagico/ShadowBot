package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"shadowbot/utils"
	"syscall"

	"github.com/bwmarrin/discordgo"
	"github.com/charmbracelet/log"
)

var (
	Token    string
	LogLevel string
)

func init() {
	tokenCLI := flag.String("t", "", "Discord bot token")
	logLevelCLI := flag.String("log", "", "Log level (debug, info, warn, error, fatal). Default: info")
	flag.Parse()

	Token = utils.GetConfig(*tokenCLI, "DISCORD_TOKEN", "")
	LogLevel = utils.GetConfig(*logLevelCLI, "LOG_LEVEL", "info")

	if Token == "" {
		log.Fatal("Discord token not provided. Use CLI (-t), environment variable (DISCORD_TOKEN), or .env file.")
	}

	utils.InitLogger(LogLevel)
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

	dg.AddHandler(utils.MessageCreate)
	dg.AddHandler(utils.VoiceStateUpdate)

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
