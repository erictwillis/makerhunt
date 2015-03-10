package main

import "os"

type Config struct {
	ClientId          string
	ClientSecret      string
	SlackToken        string
	RedirectUrl       string
	AuthenticationKey string
	EncryptionKey     string
	SessionName       string
	MongoUri          string
	Mailchimp         struct {
		Apikey string
	}
}

func NewConfig() Config {
	c := Config{}
	c.ClientId = os.Getenv("PH_OAUTH_CLIENT_ID")
	c.ClientSecret = os.Getenv("PH_OAUTH_CLIENT_SECRET")
	c.SlackToken = os.Getenv("SLACK_TOKEN")
	c.RedirectUrl = os.Getenv("REDIRECT_URL")
	c.AuthenticationKey = os.Getenv("AUTHENTICATION_KEY")
	c.EncryptionKey = os.Getenv("ENCRYPTION_KEY")
	c.MongoUri = os.Getenv("MONGOLAB_URI")
	c.Mailchimp.Apikey = os.Getenv("MAILCHIMP_APIKEY")
	c.SessionName = "token"
	return c
}
