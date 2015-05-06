package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type TwitterUser struct {
	ContributorsEnabled bool   `json:"contributors_enabled"`
	CreatedAt           string `json:"created_at"`
	DefaultProfile      bool   `json:"default_profile"`
	DefaultProfileImage bool   `json:"default_profile_image"`
	Description         string `json:"description"`
	Entities            struct {
		Description struct {
			Urls []interface{} `json:"urls"`
		} `json:"description"`
		Url struct {
			Urls []struct {
				DisplayUrl  string  `json:"display_url"`
				ExpandedUrl string  `json:"expanded_url"`
				Indices     []int64 `json:"indices"`
				Url         string  `json:"url"`
			} `json:"urls"`
		} `json:"url"`
	} `json:"entities"`
	FavouritesCount                int64       `json:"favourites_count"`
	FollowRequestSent              interface{} `json:"follow_request_sent"`
	FollowersCount                 int64       `json:"followers_count"`
	Following                      interface{} `json:"following"`
	FriendsCount                   int64       `json:"friends_count"`
	GeoEnabled                     bool        `json:"geo_enabled"`
	Id                             int64       `json:"id"`
	IdStr                          string      `json:"id_str"`
	IsTranslationEnabled           bool        `json:"is_translation_enabled"`
	IsTranslator                   bool        `json:"is_translator"`
	Lang                           string      `json:"lang"`
	ListedCount                    int64       `json:"listed_count"`
	Location                       string      `json:"location"`
	Name                           string      `json:"name"`
	Notifications                  interface{} `json:"notifications"`
	ProfileBackgroundColor         string      `json:"profile_background_color"`
	ProfileBackgroundImageUrl      string      `json:"profile_background_image_url"`
	ProfileBackgroundImageUrlHttps string      `json:"profile_background_image_url_https"`
	ProfileBackgroundTile          bool        `json:"profile_background_tile"`
	ProfileBannerUrl               string      `json:"profile_banner_url"`
	ProfileImageUrl                string      `json:"profile_image_url"`
	ProfileImageUrlHttps           string      `json:"profile_image_url_https"`
	ProfileLinkColor               string      `json:"profile_link_color"`
	ProfileLocation                interface{} `json:"profile_location"`
	ProfileSidebarBorderColor      string      `json:"profile_sidebar_border_color"`
	ProfileSidebarFillColor        string      `json:"profile_sidebar_fill_color"`
	ProfileTextColor               string      `json:"profile_text_color"`
	ProfileUseBackgroundImage      bool        `json:"profile_use_background_image"`
	Protected                      bool        `json:"protected"`
	ScreenName                     string      `json:"screen_name"`
	Status                         struct {
		Contributors interface{} `json:"contributors"`
		Coordinates  interface{} `json:"coordinates"`
		CreatedAt    string      `json:"created_at"`
		Entities     struct {
			Hashtags []interface{} `json:"hashtags"`
			Symbols  []interface{} `json:"symbols"`
			Urls     []struct {
				DisplayUrl  string  `json:"display_url"`
				ExpandedUrl string  `json:"expanded_url"`
				Indices     []int64 `json:"indices"`
				Url         string  `json:"url"`
			} `json:"urls"`
			UserMentions []interface{} `json:"user_mentions"`
		} `json:"entities"`
		FavoriteCount        int64       `json:"favorite_count"`
		Favorited            bool        `json:"favorited"`
		Geo                  interface{} `json:"geo"`
		Id                   int64       `json:"id"`
		IdStr                string      `json:"id_str"`
		InReplyToScreenName  interface{} `json:"in_reply_to_screen_name"`
		InReplyToStatusId    interface{} `json:"in_reply_to_status_id"`
		InReplyToStatusIdStr interface{} `json:"in_reply_to_status_id_str"`
		InReplyToUserId      interface{} `json:"in_reply_to_user_id"`
		InReplyToUserIdStr   interface{} `json:"in_reply_to_user_id_str"`
		Lang                 string      `json:"lang"`
		Place                interface{} `json:"place"`
		PossiblySensitive    bool        `json:"possibly_sensitive"`
		RetweetCount         int64       `json:"retweet_count"`
		Retweeted            bool        `json:"retweeted"`
		Source               string      `json:"source"`
		Text                 string      `json:"text"`
		Truncated            bool        `json:"truncated"`
	} `json:"status"`
	StatusesCount int64  `json:"statuses_count"`
	TimeZone      string `json:"time_zone"`
	Url           string `json:"url"`
	UtcOffset     int64  `json:"utc_offset"`
	Verified      bool   `json:"verified"`
}

type TwitterClient struct {
	AccessToken string
}

func NewTwitterClient() (*TwitterClient, error) {
	v := url.Values{}
	v.Set("grant_type", "client_credentials")
	client := http.Client{}

	tokenUrl := fmt.Sprintf("https://%s:%s@api.twitter.com/oauth2/token", config.Twitter.ClientId, config.Twitter.ClientSecret)
	resp, err := client.PostForm(tokenUrl, v)
	if err != nil {
		return nil, err
	}

	type OAuthResult struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
	}

	var result OAuthResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	fmt.Println(result)

	return &TwitterClient{AccessToken: result.AccessToken}, nil
}

func (tw *TwitterClient) Show(user *TwitterUser, username string) error {
	client := http.Client{}
	url := fmt.Sprintf("https://api.twitter.com/1.1/users/show.json?screen_name=%s", username)
	r, err := http.NewRequest("GET", url, nil)
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tw.AccessToken))
	resp, err := client.Do(r)
	if err != nil {
		return err
	}

	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return err
	}

	return nil
}
