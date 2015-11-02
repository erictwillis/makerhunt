package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/PuerkitoBio/goquery"
)

var ErrCrumbNotFound = errors.New("Crumb not found")

func join(inviteUrl string, username string, password string) error {
	doc, err := goquery.NewDocument(inviteUrl)
	if err != nil {
		return err
	}

	crumb := ""
	doc.Find("input[name='crumb']").Each(func(i int, s *goquery.Selection) {
		if val, exists := s.Attr("value"); exists {
			crumb = val
		}
	})

	if crumb == "" {
		return ErrCrumbNotFound
	}

	v := url.Values{}
	v.Set("crumb", crumb)
	v.Set("tz", "")
	v.Set("signup", "1")
	v.Set("username", username)
	v.Set("password", password)

	client := http.Client{}
	resp, err := client.PostForm(inviteUrl, v)
	if err != nil {
		return err
	}
	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	fmt.Println(string(b))
	// check resp.StatusCode

	return nil
}
