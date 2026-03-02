import re
import numpy as np
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

vader = SentimentIntensityAnalyzer()

# ── Constants matching Notebook 4 feature extractors ──
SLEEP_PATTERN     = re.compile(r'(\d+\.?\d*)\s*(?:hours?|hrs?)', re.IGNORECASE)
EXERCISE_HIGH     = {'hiit','crossfit','marathon','triathlon','weightlifting',
                     'powerlifting','cycling','swimming','intense','heavy'}
EXERCISE_MED      = {'gym','workout','exercise','running','jogging','training',
                     'fitness','walking','yoga','pilates','lifting','weights'}
EXERCISE_LOW      = {'sedentary','inactive','lazy','couch','sitting','no exercise',
                     'dont exercise','never exercise'}
SMOKING_KWS       = {'smok','cigarette','nicotine','vape','tobacco','cigar'}
ALCOHOL_KWS       = {'drink','alcohol','beer','wine','drunk','vodka',
                     'whiskey','liquor','booze','binge','sober','sobriety'}
STRESS_KWS        = ['stress','anxiety','anxious','overwhelmed','depressed',
                     'depression','panic','burnout','mental','therapy',
                     'worried','fear','scared','hopeless','helpless']
DIET_HEALTHY_KWS  = {'keto','salad','vegetable','fruit','protein','whole',
                     'organic','clean','balanced','nutrient','fiber'}
DIET_UNHEALTHY_KWS= {'sugar','junk','fast food','processed','candy','soda',
                     'chips','fried','dessert','cake','pizza','burger'}


def extract_sleep_hours(text: str) -> float:
    """Extract sleep hours from text. Default 7.0 if not found."""
    match = SLEEP_PATTERN.search(text)
    if match:
        val = float(match.group(1))
        return val if 1.0 <= val <= 24.0 else 7.0
    return 7.0


def extract_exercise_level(text: str) -> int:
    """
    Returns: 0=none, 1=low, 2=medium, 3=high
    Encoded to match Notebook 4 exercise_encoded
    """
    text_lower = text.lower()
    if any(k in text_lower for k in EXERCISE_HIGH):
        return 3
    if any(k in text_lower for k in EXERCISE_MED):
        return 2
    if any(k in text_lower for k in EXERCISE_LOW):
        return 0
    return 1  # default: low


def extract_substance_use(text: str) -> dict:
    """
    Returns smoking, alcohol, any_substance flags.
    Includes basic negation handling (fixes Notebook 4 bug).
    """
    text_lower = text.lower()

    def check_with_negation(keywords: set) -> bool:
        for kw in keywords:
            idx = text_lower.find(kw)
            if idx == -1:
                continue
            # Check 30 chars before for negation words
            window = text_lower[max(0, idx-30):idx]
            negations = ['never','not','no ','don\'t','doesn\'t',
                         'without','quit','stopped','haven\'t','hasn\'t']
            if not any(neg in window for neg in negations):
                return True
        return False

    smoking = check_with_negation(SMOKING_KWS)
    alcohol = check_with_negation(ALCOHOL_KWS)

    return {
        'smoking_detected' : int(smoking),
        'alcohol_detected' : int(alcohol),
        'substance_use_flag': int(smoking or alcohol)
    }


def extract_stress_score(text: str) -> float:
    """
    Combined VADER sentiment + stress keyword frequency.
    Returns 0.0 - 1.0 score.
    """
    sentiment    = vader.polarity_scores(text)
    neg_sentiment= max(0, -sentiment['compound'])  # 0 to 1
    stress_count = sum(text.lower().count(w) for w in STRESS_KWS)
    kw_score     = min(stress_count / 5.0, 1.0)
    return round((neg_sentiment * 0.5) + (kw_score * 0.5), 4)


def extract_diet_quality(text: str) -> int:
    """
    Returns sugar_intake proxy: 0=low, 1=medium, 2=high
    To match Notebook 4 sugar_intake_encoded
    """
    text_lower = text.lower()
    healthy_count   = sum(1 for k in DIET_HEALTHY_KWS   if k in text_lower)
    unhealthy_count = sum(1 for k in DIET_UNHEALTHY_KWS if k in text_lower)

    if unhealthy_count > healthy_count:
        return 2  # high sugar
    if healthy_count > unhealthy_count:
        return 0  # low sugar
    return 1      # medium (default)


def extract_all_features(text: str) -> dict:
    """
    Master feature extractor — runs all 5 extractors.
    Returns dict of all extracted features.
    """
    substance = extract_substance_use(text)
    sentiment = vader.polarity_scores(text)

    return {
        'sleep_hours'        : extract_sleep_hours(text),
        'exercise_level'     : extract_exercise_level(text),
        'exercise_label'     : ['none','low','medium','high'][
                                extract_exercise_level(text)],
        'smoking_detected'   : substance['smoking_detected'],
        'alcohol_detected'   : substance['alcohol_detected'],
        'substance_use_flag' : substance['substance_use_flag'],
        'stress_score'       : extract_stress_score(text),
        'diet_quality'       : extract_diet_quality(text),
        'diet_label'         : ['low_sugar','medium_sugar','high_sugar'][
                                extract_diet_quality(text)],
        'sentiment_compound' : round(sentiment['compound'], 4),
        'sentiment_label'    : (
            'positive' if sentiment['compound'] > 0.05
            else 'negative' if sentiment['compound'] < -0.05
            else 'neutral'
        ),
    }