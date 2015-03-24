package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"mime/multipart"
	"net/http"
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
		Headers     map[string]string `json:"header"`
		Body        []byte            `json:"body"`
	}

	var err error
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	contentType, ok := msg.Headers["Content-Type"]
	if !ok {
		log.Println(err)
		http.Error(w, err.Error(), 500)
		return
	}

	mediaType, params, err := mime.ParseMediaType(contentType)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), 500)
		return
	}

	if strings.HasPrefix(mediaType, "multipart/") {
		buffer := bytes.NewBuffer(msg.Body)
		mr := multipart.NewReader(buffer, params["boundary"])
		for {
			p, err := mr.NextPart()
			if err == io.EOF {
				return
			}
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

			slurp, err := ioutil.ReadAll(p)
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
				log.Fatal(err)
			}

			fmt.Printf("Part %q: %q\n", p.Header.Get("Foo"), slurp)

			contentType, ok := msg.Headers["Content-Type"]
			if !ok {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

			mediaType, _, err := mime.ParseMediaType(contentType)
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

			if !strings.HasPrefix(mediaType, "multipart/") {
				continue
			}

			doc, err := goquery.NewDocumentFromReader(p)
			if err != nil {
				log.Println(err)
				http.Error(w, err.Error(), 500)
				return
			}

			inviteUrl := ""
			doc.Find("a").Each(func(i int, s *goquery.Selection) {
				if href, exists := s.Attr("href"); exists {
					if strings.Contains(href, "invite") {
						inviteUrl = href
					}
				}
			})

			fmt.Println("invite url found: href")
		}
	}

}
