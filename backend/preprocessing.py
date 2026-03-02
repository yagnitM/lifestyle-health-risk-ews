import re
import string

# ── Same 244 stopwords from Notebook 2 ──
CUSTOM_STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
    'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm',
    'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
    'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan',
    'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'also', 'would', 'like',
    'get', 'got', 'know', 'think', 'going', 'really', 'make', 'go', 'see',
    'said', 'say', 'way', 'one', 'two', 'time', 'even', 'back', 'could',
    'still', 'take', 'us', 'much', 'well', 'good', 'new', 'first', 'last',
    'long', 'great', 'little', 'own', 'right', 'big', 'high', 'different',
    'small', 'large', 'next', 'early', 'young', 'important', 'public',
    'bad', 'same', 'able', 'http', 'www', 'com', 'reddit', 'amp', 'gt',
    'lt', 'edit', 'update', 'deleted', 'removed', 'post', 'comment',
    'thread', 'sub', 'subreddit', 'upvote', 'downvote', 'crosspost',
    'oc', 'tldr', 'eli5', 'ama', 'imho', 'imo', 'afaik', 'fwiw',
}


def clean_text(text: str) -> str:
    """
    Full text cleaning pipeline matching Notebook 2 preprocessing.
    Input  : raw Reddit post text
    Output : cleaned, normalised string ready for TF-IDF / SBERT
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    # 1. Lowercase
    text = text.lower()

    # 2. Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)

    # 3. Remove Reddit-specific patterns
    text = re.sub(r'/r/\w+|/u/\w+|r/\w+|u/\w+', '', text)

    # 4. Remove HTML entities
    text = re.sub(r'&[a-z]+;|&#\d+;', ' ', text)

    # 5. Remove special characters, keep letters/numbers/spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)

    # 6. Remove standalone numbers
    text = re.sub(r'\b\d+\b', '', text)

    # 7. Tokenise
    tokens = text.split()

    # 8. Remove stopwords and short tokens
    tokens = [t for t in tokens
              if t not in CUSTOM_STOPWORDS and len(t) > 2]

    # 9. Rejoin
    cleaned = ' '.join(tokens)

    # 10. Collapse multiple spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    return cleaned