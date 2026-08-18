-- The redesigned contact form adds an optional "Subject" field.
-- Run this once against your existing `messages` table.

alter table messages
  add column if not exists subject text;
