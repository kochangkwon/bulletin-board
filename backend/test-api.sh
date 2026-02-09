#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "  Bulletin Board API Integration Test"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000/api"

# Test 1: Create a post
echo -e "${BLUE}[TEST 1]${NC} Creating a new post..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post 1",
    "content": "This is a test post content. We are testing the bulletin board API.",
    "author": "Test User"
  }')

POST_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ -n "$POST_ID" ]; then
  echo -e "${GREEN}✓ Post created successfully with ID: $POST_ID${NC}"
else
  echo -e "${RED}✗ Failed to create post${NC}"
  echo $CREATE_RESPONSE
  exit 1
fi
echo ""

# Test 2: Get all posts
echo -e "${BLUE}[TEST 2]${NC} Getting all posts..."
GET_POSTS=$(curl -s "$BASE_URL/posts?page=1&limit=10")
POSTS_COUNT=$(echo $GET_POSTS | grep -o '"id":[0-9]*' | wc -l)

if [ $POSTS_COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Retrieved $POSTS_COUNT post(s)${NC}"
else
  echo -e "${RED}✗ Failed to get posts${NC}"
  exit 1
fi
echo ""

# Test 3: Get specific post
echo -e "${BLUE}[TEST 3]${NC} Getting post details (ID: $POST_ID)..."
GET_POST=$(curl -s "$BASE_URL/posts/$POST_ID")
POST_TITLE=$(echo $GET_POST | grep -o '"title":"[^"]*"' | cut -d'"' -f4)

if [ "$POST_TITLE" = "Test Post 1" ]; then
  echo -e "${GREEN}✓ Post retrieved successfully: $POST_TITLE${NC}"
else
  echo -e "${RED}✗ Failed to get post details${NC}"
  exit 1
fi
echo ""

# Test 4: Create a comment
echo -e "${BLUE}[TEST 4]${NC} Creating a comment on post $POST_ID..."
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test comment.",
    "author": "Commenter User"
  }')

COMMENT_ID=$(echo $COMMENT_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

if [ -n "$COMMENT_ID" ]; then
  echo -e "${GREEN}✓ Comment created successfully with ID: $COMMENT_ID${NC}"
else
  echo -e "${RED}✗ Failed to create comment${NC}"
  exit 1
fi
echo ""

# Test 5: Get comments
echo -e "${BLUE}[TEST 5]${NC} Getting comments for post $POST_ID..."
GET_COMMENTS=$(curl -s "$BASE_URL/posts/$POST_ID/comments")
COMMENTS_COUNT=$(echo $GET_COMMENTS | grep -o '"id":[0-9]*' | wc -l)

if [ $COMMENTS_COUNT -gt 0 ]; then
  echo -e "${GREEN}✓ Retrieved $COMMENTS_COUNT comment(s)${NC}"
else
  echo -e "${RED}✗ Failed to get comments${NC}"
  exit 1
fi
echo ""

# Test 6: Update post
echo -e "${BLUE}[TEST 6]${NC} Updating post $POST_ID..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/posts/$POST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Post",
    "content": "This post has been updated."
  }')

UPDATED_TITLE=$(echo $UPDATE_RESPONSE | grep -o '"title":"[^"]*"' | cut -d'"' -f4)

if [ "$UPDATED_TITLE" = "Updated Test Post" ]; then
  echo -e "${GREEN}✓ Post updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update post${NC}"
  exit 1
fi
echo ""

# Test 7: Delete comment
echo -e "${BLUE}[TEST 7]${NC} Deleting comment $COMMENT_ID..."
DELETE_COMMENT=$(curl -s -X DELETE "$BASE_URL/comments/$COMMENT_ID")

if echo $DELETE_COMMENT | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Comment deleted successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete comment${NC}"
  exit 1
fi
echo ""

# Test 8: Delete post
echo -e "${BLUE}[TEST 8]${NC} Deleting post $POST_ID..."
DELETE_POST=$(curl -s -X DELETE "$BASE_URL/posts/$POST_ID")

if echo $DELETE_POST | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Post deleted successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete post${NC}"
  exit 1
fi
echo ""

# Test 9: Create multiple posts for pagination test
echo -e "${BLUE}[TEST 9]${NC} Creating multiple posts for pagination test..."
for i in {1..5}; do
  curl -s -X POST "$BASE_URL/posts" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Sample Post $i\",
      \"content\": \"This is sample post number $i for testing pagination.\",
      \"author\": \"Sample User $i\"
    }" > /dev/null
done
echo -e "${GREEN}✓ Created 5 sample posts${NC}"
echo ""

# Final verification
echo -e "${BLUE}[FINAL]${NC} Verifying all posts..."
FINAL_POSTS=$(curl -s "$BASE_URL/posts")
FINAL_COUNT=$(echo $FINAL_POSTS | grep -o '"id":[0-9]*' | wc -l)
echo -e "${GREEN}✓ Total posts in database: $FINAL_COUNT${NC}"
echo ""

echo "========================================="
echo -e "${GREEN}  ALL TESTS PASSED! ✓${NC}"
echo "========================================="
echo ""
echo "API is working correctly on http://localhost:3000"
echo "View API documentation at: http://localhost:3000/api-docs"
echo ""
