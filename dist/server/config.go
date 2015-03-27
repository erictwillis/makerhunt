package main

import (
	"os"

	"github.com/kurrik/oauth1a"
)

type Config struct {
	ClientId          string
	ClientSecret      string
	SlackToken        string
	RedirectUrl       string
	AuthenticationKey string
	EncryptionKey     string
	SessionName       string
	Static            string
	MongoUri          string
	Twitter           struct {
		ClientId       string
		ClientSecret   string
		ConsumerKey    string
		ConsumerSecret string
		Service        *oauth1a.Service
	}

	Mailchimp struct {
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

	c.Static = os.Getenv("STATIC")
	if c.Static == "" {
		c.Static = "public"
	}

	c.Twitter.ClientId = os.Getenv("TWITTER_CLIENTID")
	c.Twitter.ClientSecret = os.Getenv("TWITTER_CLIENTSECRET")
	c.Twitter.ConsumerKey = os.Getenv("TWITTER_CONSUMER_KEY")
	c.Twitter.ConsumerSecret = os.Getenv("TWITTER_CONSUMER_SECRET")

	c.Twitter.Service = &oauth1a.Service{
		RequestURL:   "https://api.twitter.com/oauth/request_token",
		AuthorizeURL: "https://api.twitter.com/oauth/authorize",
		AccessURL:    "https://api.twitter.com/oauth/access_token",
		ClientConfig: &oauth1a.ClientConfig{
			ConsumerKey:    c.Twitter.ConsumerKey,
			ConsumerSecret: c.Twitter.ConsumerSecret,
			CallbackURL:    c.RedirectUrl,
		},
		Signer: new(oauth1a.HmacSha1Signer),
	}

	return c
}
