package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"net/mail"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func apiHookSmtp(w http.ResponseWriter, r *http.Request) {
	type Address struct {
		Name    string `json:"name"`
		Address string `json:"address"`
	}

	var msg struct {
		From        Address           `json:"from"`
		To          []Address         `json:"to"`
		AddressList []Address         `json:"address_list"`
		Date        *time.Time        `json:"date"`
		Header      mail.Header       `json:"header"`
		Body        []byte            `json:"body"`
		Parts       map[string][]byte `json:"parts"`
	}

	// var err error
	if err := json.NewDecoder(io.TeeReader(r.Body, os.Stdout)).Decode(&msg); err != nil {
		log.Println(err)
		http.Error(w, err.Error(), 500)
		return
	}

	/*

			inviteUrl := ""
			for contentType, p := range msg.Parts {
				fmt.Printf("Part %q: %q\n", contentType, p)

				mediaType, _, err := mime.ParseMediaType(contentType)
				if err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
					return
				}

				if !strings.HasPrefix(mediaType, "text/html") {
					continue
				}

				doc, err := goquery.NewDocumentFromReader(bytes.NewReader(p))
				if err != nil {
					log.Println(err)
					http.Error(w, err.Error(), 500)
					return
				}

				doc.Find("a").Each(func(i int, s *goquery.Selection) {
					if href, exists := s.Attr("href"); exists {
						if strings.Contains(href, "invite") {
							inviteUrl = href
						}
					}
				})

				fmt.Println("invite url found: %s", inviteUrl)
			}

			if inviteUrl == "" {
				err := errors.New("Could not detect invite url.")
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

		// get user object for makerhunt id.
		username := strings.Split(msg.Header.Get("To"), "@")[0]
		password := "verycomplexpassword123@"
		err := join(inviteUrl, username, password)
		log.Println(err)
	*/

	// Header sender feedback?

	//mx, err := net.LookupMX(strings.Split(msg.Header.Get("To"), "@")[1])
	mx, err := net.LookupMX("dutchcoders.io")
	if err != nil {
		log.Println(err)
	}

	fmt.Printf("MX %#v\n", mx)

	c, err := smtp.Dial(net.JoinHostPort("email-smtp.eu-west-1.amazonaws.com", "587"))
	if err != nil {
		log.Fatal(err)
	}

	c.StartTLS(&tls.Config{ServerName: "email-smtp.eu-west-1.amazonaws.com"})

	// Set up authentication information.
	auth := smtp.PlainAuth("", "AKIAJHJLHZU56RPJMV4A", "AjbRhUH6icIWkjrzEaV4mrhKJzme+/zt2GCO6lRDr3AR", "email-smtp.eu-west-1.amazonaws.com")

	if err := c.Auth(auth); err != nil {
		log.Fatal(err)
	}

	// Set the sender and recipient first
	if err := c.Mail("remco@makers.dutchcoders.io"); err != nil {
		log.Fatal(err)
	}
	if err := c.Rcpt("remco@dutchcoders.io"); err != nil {
		log.Fatal(err)
	}

	// Send the email body.
	wc, err := c.Data()
	if err != nil {
		log.Fatal(err)
	}
	_, err = fmt.Fprintf(wc, "This is the email body")
	if err != nil {
		log.Fatal(err)
	}
	err = wc.Close()
	if err != nil {
		log.Fatal(err)
	}

	// Send the QUIT command and close the connection.
	err = c.Quit()
	if err != nil {
		log.Fatal(err)
	}

	inviteUrl := ""
	for contentType, p := range msg.Parts {
		fmt.Printf("Part %q: %q\n", contentType, p)

		mediaType, _, err := mime.ParseMediaType(contentType)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		if !strings.HasPrefix(mediaType, "text/html") {
			continue
		}

		doc, err := goquery.NewDocumentFromReader(bytes.NewReader(p))
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), 500)
			return
		}

		doc.Find("a").Each(func(i int, s *goquery.Selection) {
			if href, exists := s.Attr("href"); exists {
				if strings.Contains(href, "invite") {
					inviteUrl = href
				}
			}
		})

		fmt.Println("invite url found: %s", inviteUrl)
	}

	if inviteUrl == "" {
		err := errors.New("Could not detect invite url.")
		log.Println(err)
		http.Error(w, err.Error(), 500)
		return
	}

	// get user object for makerhunt id.
	username := strings.Split(msg.Header.Get("To"), "@")[0]
	password := "verycomplexpassword123@"
	err = join(inviteUrl, username, password)
	log.Println(err)
}
