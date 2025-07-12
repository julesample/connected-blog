CREATE TABLE IF NOT EXISTS friends (
  user_id1 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id2 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id1, user_id2)
);

CREATE POLICY "Users can view their own friends" ON friends FOR SELECT TO authenticated USING (auth.uid() = user_id1 OR auth.uid() = user_id2);
CREATE POLICY "Users can add friends" ON friends FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id1);
CREATE POLICY "Users can remove friends" ON friends FOR DELETE TO authenticated USING (auth.uid() = user_id1);

CREATE POLICY "Users can view posts from friends" ON posts FOR SELECT TO authenticated USING (privacy = 'friends' AND author_id IN (
  SELECT user_id2 FROM friends WHERE user_id1 = auth.uid()
));
