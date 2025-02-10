attach database '/Users/ricgagliardi/Library/CloudStorage/Dropbox/dev/util-verifyit-4/data-transform/verifyit.db' as input
;

CREATE TABLE author (
	author_id TEXT primary key,
	author_name TEXT not null unique,
	author_is_manager INT not null default 0,
	author_is_active INT not null default 1
);
insert into author 
	select
		_user_id as author_id,
		_full_name as author_name,
		CASE
			WHEN _roles LIKE '%Manager%' THEN 1
			WHEN _roles LIKE '%manager%' THEN 1
			ELSE 0
		END AS author_is_manager,
		_is_active as author_is_active
	FROM input._user
;

CREATE TABLE status(status_name TEXT primary key)
;
insert into status
	select * from input.status
;

CREATE TABLE source (
  source_id TEXT primary key,
  name TEXT not null,
  description TEXT not null,
  hints TEXT,
  _asof TEXT not null default current_timestamp,
  _by TEXT not null default 'unknown'
);
insert into source
	select source_id, name, description, hints, current_timestamp as _asof, 'unknown' as _by 
	from input.source
;

-- populate question.us_state with transform.js
CREATE TABLE question(
  question_id TEXT primary key,
  title TEXT unique,
  _old_categories TEXT,
  content TEXT not null,
  content_image,
  followup TEXT not null,
  followup_image,
  choices TEXT not null,
  correct_choice INT not null,
  hints TEXT,
  private_comments TEXT,
  status_name TEXT not null references status(status_name) DEFERRABLE INITIALLY DEFERRED,
  difficulty TEXT not null default 'any',
  us_state,
  author_id TEXT not null references author (author_id),
  date_created TEXT not null default current_timestamp,
  _by TEXT not null default 'unknown',
  _asof TEXT not null default current_timestamp
);
insert into question
	SELECT
		question_id,
		title,
		question_categories as _old_categories,
		question_content as content,
		'' as content_image,
		ifnull(followup,'?'),
		'' as followup_image,
		choices,
		correct_choice,
		hints,
		private_comments,
		status_name,
		difficulty,
		'' as us_state,
		author as author_id,
		created as date_created,
		last_mod_by as _by,
		last_modified as _asof
	FROM input.question
; 

create table topic (
	topic_name text primary key,
	status_name text not null references status(status_name) DEFERRABLE INITIALLY DEFERRED,
	topic_color text not null,
	topic_sequence integer not null,
  _asof TEXT not null default current_timestamp,
  _by TEXT not null default 'unknown'
);
insert into topic (topic_name, status_name, topic_color, topic_sequence) values
	('Civics', 'Production', 'D5F382', 10),
	('U.S. Constitution', 'Production', '2FB394', 20),
	('Voting', 'Production', '0DB6EC', 30),
	('News', 'Production', 'FF8383', 40),
	('Mix it up', 'Production', '1278FF', 50)
;

-- populate with transform.js
create table topic_question (
	topic_question_id text primary key,
	topic_name text not null references topic(topic_name) DEFERRABLE INITIALLY DEFERRED,
	question_id text not null references question(question_id) DEFERRABLE INITIALLY DEFERRED
);
create table play (
	play_id text primary key,
	play_mode text not null, -- single-player, classroom, competitive
	topic_name text not null references topic(topic_name) DEFERRABLE INITIALLY DEFERRED, -- topic table does not have or need an id column, will use topic_name as pkey
	room text,
	"location" text, -- city, state
	difficulty text,
	topic_color,
	start_time text,
	end_time text,
	questions text, -- list of question ids
	current_question integer -- which question is currently in play
);
create table player (
	play_id text primary key,
	player_name text not null,
	scores text -- list of scores on each question
);
create table passcode (
	passcode_name text primary key,
	expires text 
);
insert into passcode (passcode_name, expires) values ('Denver', '2025-07-01')
;


