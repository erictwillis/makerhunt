// Copyright 2015 Kevin Yeh. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package gohunt

import (
	"bytes"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
)

type Request struct {
	url       string
	action    string
	values    *url.Values
	cookie    *http.Cookie
	useragent string
}

func (r Request) getResponse() (*bytes.Buffer, error) {
	return r.getAuthResponse("")
}

func (r Request) getAuthResponse(auth string) (*bytes.Buffer, error) {

	// Determine the HTTP action.
	var action, finalurl string
	if r.action == "" {
		action = "GET"
	} else {
		action = r.action
	}
	if r.values == nil {
		finalurl = r.url
	} else {
		finalurl = r.url + "?" + r.values.Encode()
	}

	// Create a request and add the proper headers.
	req, err := http.NewRequest(action, finalurl, nil)
	if err != nil {
		return nil, err
	}
	if r.cookie != nil {
		req.AddCookie(r.cookie)
	}
	req.Header.Set("User-Agent", r.useragent)
	if auth != "" {
		req.Header.Set("Authorization", auth)
	}

	// Handle the request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		err = errors.New(resp.Status)
	}

	respbytes, newerr := ioutil.ReadAll(resp.Body)
	if err == nil {
		err = newerr
	}
	return bytes.NewBuffer(respbytes), err
}
