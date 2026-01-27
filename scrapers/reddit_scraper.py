import os
import praw
import pandas as pd
import time
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

client_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")
username = os.getenv("REDDIT_USERNAME")
password = os.getenv("REDDIT_PASSWORD")
user_agent = os.getenv("REDDIT_USER_AGENT")

reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    username=username,
    password=password,
    user_agent=user_agent
)

subreddit_categories = {
    "fitness": ["fitness", "bodyweightfitness", "running"],
    "weight_loss": ["loseit", "1200isplenty", "intermittentfasting"],
    "diabetes": ["diabetes", "diabetes_t2", "diabetes_t1"],
    "diet": ["keto", "nutrition", "EatCheapAndHealthy"],
    "sleep": ["sleep", "insomnia", "sleepapnea"],
    "substance": ["stopdrinking", "leaves", "stopsmoking"],
    "mental_physical": ["HealthAnxiety", "chronicpain", "migraine"]
}

def scrape_subreddit(subreddit_name, limit=3000):
    print(f"Scraping r/{subreddit_name}...")
    subreddit = reddit.subreddit(subreddit_name)
    posts = []

    for submission in subreddit.new(limit=limit):
        if submission.selftext and len(submission.selftext) > 50:
            posts.append({
                "id": submission.id,
                "title": submission.title,
                "text": submission.selftext,
                "created_utc": submission.created_utc,
                "score": submission.score,
                "num_comments": submission.num_comments,
                "subreddit": submission.subreddit.display_name
            })

    return pd.DataFrame(posts)

def scrape_and_merge_category(category_name, subreddit_list, limit_per_sub=3000):
    all_posts = []
    
    for subreddit_name in subreddit_list:
        try:
            clean_name = subreddit_name.replace("r/", "").lower()
            df = scrape_subreddit(clean_name, limit=limit_per_sub)
            
            if not df.empty:
                df['category'] = category_name
                all_posts.append(df)
                print(f"Successfully scraped {len(df)} posts from {subreddit_name}")
            
            time.sleep(1)
            
        except Exception as e:
            print(f"Error scraping {subreddit_name}: {e}")
    
    if all_posts:
        merged_df = pd.concat(all_posts, ignore_index=True)
        merged_df = merged_df.drop_duplicates(subset=['id'])
        
        output_path = f"../data/raw/{category_name}.csv"
        merged_df.to_csv(output_path, index=False)
        print(f"Saved {len(merged_df)} unique posts to {output_path}")
        return merged_df
    return pd.DataFrame()

if __name__ == "__main__":
    for category, subreddits in subreddit_categories.items():
        scrape_and_merge_category(category, subreddits, limit_per_sub=3000)
        print(f"Finished {category}\n" + "-"*30)