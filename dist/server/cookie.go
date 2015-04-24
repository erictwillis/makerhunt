package main

import (
	"net/http"

	"github.com/gorilla/sessions"
	"gopkg.in/mgo.v2/bson"
)

type Cookie interface {
	Get(*http.Request) error
	Save(http.ResponseWriter, *http.Request) error
	Delete(http.ResponseWriter, *http.Request) error
}

func GetSessionCookie(r *http.Request) (*SessionCookie, error) {
	cookie := SessionCookie{}
	return &cookie, cookie.Get(r)
}

type SessionCookie struct {
	Cookie
	s *sessions.Session
}

func (cookie *SessionCookie) Get(r *http.Request) error {
	var err error
	cookie.s, err = store.Get(r, config.SessionName)
	cookie.s.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}

	return err
}

func (cookie *SessionCookie) AccessTokenKey() string {
	if cookie.s.Values["access_token_key"] == nil {
		return ""
	}
	return cookie.s.Values["access_token_key"].(string)
}

func (cookie *SessionCookie) SetAccessTokenKey(v string) {
	cookie.s.Values["access_token_key"] = v
}

func (cookie *SessionCookie) AccessTokenSecret() string {
	if cookie.s.Values["access_token_secret"] == nil {
		return ""
	}
	return cookie.s.Values["access_token_secret"].(string)
}

func (cookie *SessionCookie) SetAccessTokenSecret(v string) {
	cookie.s.Values["access_token_secret"] = v
}

func (cookie *SessionCookie) IsAuthenticated() bool {
	return cookie.s.Values["userid"] != nil
}

func (cookie *SessionCookie) UserId() bson.ObjectId {
	return bson.ObjectIdHex(cookie.s.Values["userid"].(string))
}

func (cookie *SessionCookie) SetUserId(v bson.ObjectId) {
	cookie.s.Values["userid"] = v.Hex()
}

func (cookie *SessionCookie) Save(w http.ResponseWriter, r *http.Request) {
	cookie.s.Save(r, w)
}

func (cookie *SessionCookie) Delete(w http.ResponseWriter, r *http.Request) {
	cookie.s.Options.MaxAge = -1
	cookie.s.Save(r, w)
}

func GetOAuthCookie(r *http.Request) (*OAuthCookie, error) {
	cookie := OAuthCookie{}
	return &cookie, cookie.Get(r)
}

type OAuthCookie struct {
	Cookie
	s *sessions.Session
}

func (cookie *OAuthCookie) Get(r *http.Request) error {
	var err error
	cookie.s, err = store.Get(r, "oauth")

	cookie.s.Options = &sessions.Options{
		Path:     "/",
		HttpOnly: true,
	}

	return err
}

func (cookie *OAuthCookie) RequestTokenKey() string {
	return cookie.s.Values["request_token_key"].(string)
}

func (cookie *OAuthCookie) RequestTokenSecret() string {
	return cookie.s.Values["request_token_secret"].(string)
}

func (cookie *OAuthCookie) SetRequestTokenKey(v string) {
	cookie.s.Values["request_token_key"] = v
}

func (cookie *OAuthCookie) SetRequestTokenSecret(v string) {
	cookie.s.Values["request_token_secret"] = v
}

func (cookie *OAuthCookie) Save(w http.ResponseWriter, r *http.Request) {
	cookie.s.Save(r, w)
}

func (cookie *OAuthCookie) Delete(w http.ResponseWriter, r *http.Request) {
	cookie.s.Options.MaxAge = -1
	cookie.s.Save(r, w)
}
