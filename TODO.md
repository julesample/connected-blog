# TODO: Implement Pagination and Search in UserProfile.tsx

- [ ] Add state variables: searchQuery, currentPage, postsPerPage (set to 10)
- [ ] Add useEffect to reset currentPage when searchQuery changes
- [ ] Add search input field above the posts table to filter posts by title or content
- [ ] Compute filteredPosts based on searchQuery (case-insensitive, strip HTML from content)
- [ ] Compute paginatedPosts from filteredPosts
- [ ] Update posts table rendering to use paginatedPosts instead of all posts
- [ ] Add pagination controls below the posts table (Previous, Next, page numbers)
- [ ] Handle empty states for no posts or no filtered posts
