package main

import "os"

type Config struct {
	ClientId     string
	ClientSecret string
	SlackToken   string
	RedirectUrl  string
}

func NewConfig() Config {
	c := Config{}
	c.ClientId = os.Getenv("PH_OAUTH_CLIENT_ID")
	c.ClientSecret = os.Getenv("PH_OAUTH_CLIENT_SECRET")
	c.SlackToken = os.Getenv("SLACK_TOKEN")
	c.RedirectUrl = os.Getenv("REDIRECT_URL")
	return c
}
