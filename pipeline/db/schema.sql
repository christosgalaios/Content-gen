CREATE TABLE IF NOT EXISTS content_library (
  id TEXT PRIMARY KEY,
  file_path TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  media_type TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  categories_json TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  people_count INTEGER,
  quality_score REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TEXT,
  indexed_at TEXT NOT NULL,
  file_modified_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trend_cache (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  relevance_score REAL NOT NULL DEFAULT 0,
  popularity_score REAL NOT NULL DEFAULT 0,
  suggested_format TEXT,
  scraped_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_plans (
  id TEXT PRIMARY KEY,
  plan_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS render_jobs (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  plan_item_id TEXT NOT NULL,
  composition_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  props_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  output_path TEXT,
  error_message TEXT,
  started_at TEXT,
  completed_at TEXT,
  FOREIGN KEY (plan_id) REFERENCES content_plans(id)
);

CREATE TABLE IF NOT EXISTS events (
  meetup_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date_time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT 'other',
  capacity INTEGER,
  attendees INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  meetup_url TEXT NOT NULL,
  scraped_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_plans (
  id TEXT PRIMARY KEY,
  event_meetup_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  FOREIGN KEY (event_meetup_id) REFERENCES events(meetup_id),
  FOREIGN KEY (plan_id) REFERENCES content_plans(id)
);

CREATE INDEX IF NOT EXISTS idx_content_quality ON content_library(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_trend_expires ON trend_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_render_status ON render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date_time);
CREATE INDEX IF NOT EXISTS idx_event_plans_event ON event_plans(event_meetup_id);
