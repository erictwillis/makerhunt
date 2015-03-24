package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"net/mail"
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
}
