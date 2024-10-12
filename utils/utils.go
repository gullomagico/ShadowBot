package utils

import (
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/joho/godotenv"
)

func InitLogger(logLevel string) {
	level, err := log.ParseLevel(string(logLevel))
	if err != nil {
		log.Info("Invalid log level. Defaulting to info")
		logLevel = "info"
	}

	log.SetLevel(level)
	log.SetTimeFormat("2006-01-02 15:04:05.000")
}

func LoadSecrets(path *string) {
	if path != nil && *path != "" {
		err := godotenv.Load(*path)
		if err != nil {
			log.Fatal(fmt.Sprintf("Error loading custom .env file: %v", err))
		}

		log.Info(fmt.Sprintf("Loaded custom .env file from %s", *path))
	} else {
		defaultSecretPath := "/run/secrets/shadowbot"

		if _, err := os.Stat(defaultSecretPath); err == nil {
			err := godotenv.Overload(defaultSecretPath)
			if err != nil {
				log.Fatal(fmt.Sprintf("Error loading secret file from Docker: %v", err))
			}
		} else {
			err := godotenv.Load()
			if err != nil {
				log.Info(fmt.Sprintf("Error loading custom .env file: %v", err))
			}
		}
	}
}
