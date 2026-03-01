CREATE TABLE blogs (
id SERIAL PRIMARY KEY,
author text,
url text NOT NULL,
title text NOT NULL,
likes INTEGER DEFAULT 0,
date time);

insert into blogs (author, url, title, likes) values ('Luke C'
, 'www.lchen.dev/awesome', 'awesome post', 100);

insert into blogs (author, url, title, likes) values ('Sarah D'
, 'www.google.com/awesome', 'okay post', 0);