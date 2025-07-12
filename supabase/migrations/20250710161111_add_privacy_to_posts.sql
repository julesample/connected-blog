ALTER TABLE posts
ADD COLUMN privacy TEXT NOT NULL DEFAULT 'public';

CREATE POLICY "Users can view public posts" ON posts FOR SELECT TO authenticated USING (privacy = 'public');
CREATE POLICY "Users can view their own private posts" ON posts FOR SELECT TO authenticated USING (privacy = 'private' AND auth.uid() = author_id);
