# Health Risk Assessment from Social Media Data

A machine learning-based system for identifying and assessing health risks through analysis of social media discussions and user-generated content.

## 📋 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Data Sources](#data-sources)
- [Methodology](#methodology)
- [Results](#results)
- [Future Work](#future-work)
- [Timeline](#timeline)
- [Contributing](#contributing)

## 🎯 Overview

This project aims to develop an automated health risk assessment system by analyzing social media conversations. By processing and analyzing posts from platforms like Reddit, Twitter, and YouTube, the system identifies health-related discussions and assesses potential risk indicators across multiple domains including:

- Mental health conditions
- Physical health issues
- Substance use patterns
- Lifestyle and fitness behaviors
- Dietary habits
- Sleep disorders

**Project Type:** Capstone Project  
**Duration:** 3 months  
**Current Status:** Data Collection & Initial Analysis Phase

## 📁 Project Structure

```
capstone-project/
│
├── backend/                    # Backend API and core processing
│   ├── feature_extraction.py  # Feature engineering module
│   ├── main.py                # Main application entry point
│   ├── model.py               # ML model definitions
│   ├── preprocessing.py       # Data preprocessing utilities
│   ├── risk_scoring.py        # Risk assessment algorithms
│   └── requirements.txt       # Python dependencies
│
├── data/                      # Data directory
│   ├── raw/                   # Raw scraped data
│   │   ├── diabetes.csv
│   │   ├── diet.csv
│   │   ├── fitness.csv
│   │   ├── mental_physical.csv
│   │   ├── sleep.csv
│   │   ├── substance.csv
│   │   └── weight_loss.csv
│   └── processed/             # Cleaned and processed data
│
├── frontend/                  # Frontend interface (separate directory)
│
├── notebook/                  # Jupyter notebooks for analysis
│   ├── 1.EDA.ipynb           # Exploratory Data Analysis
│   ├── 2.Preprocessing.ipynb # Data preprocessing pipeline
│   ├── 3.Model_Training.ipynb # Model training experiments
│   └── 4.Results_Analysis.ipynb # Results and evaluation
│
├── scrapers/                  # Data collection scripts
│   ├── reddit_scraper.py     # Reddit data scraper (✅ Completed)
│   ├── twitter_scraper.py    # Twitter data scraper (🔄 Planned)
│   └── youtube_scraper.py    # YouTube data scraper (🔄 Planned)
│
├── reports/                   # Generated reports and visualizations
│
├── results/                   # Model outputs and predictions
│
└── README.md                  # Project documentation (this file)
```

## ✨ Features

### Current Features
- ✅ **Reddit Data Scraping**: Automated collection from health-related subreddits (~19,000 posts collected)
- ✅ **Multi-domain Coverage**: Diabetes, diet, fitness, mental health, sleep, substance use
- 🔄 **Text Preprocessing**: Cleaning, tokenization, and normalization pipeline
- 🔄 **Feature Extraction**: NLP-based feature engineering
- 🔄 **Risk Scoring**: Multi-dimensional health risk assessment

### Planned Features
- 🔜 **Twitter Integration**: Extended data collection from Twitter/X
- 🔜 **YouTube Analysis**: Comment and transcript analysis
- 🔜 **Advanced NLP**: Transformer-based models (BERT, GPT)
- 🔜 **Real-time Monitoring**: Live social media tracking
- 🔜 **Visualization Dashboard**: Interactive results dashboard

## 🚀 Installation

### Prerequisites
- Python 3.8+
- pip package manager
- Virtual environment (recommended)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd capstone-project
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Configure API keys** (if applicable)
```bash
# Create a .env file in the backend directory
echo "REDDIT_CLIENT_ID=your_client_id" >> .env
echo "REDDIT_CLIENT_SECRET=your_client_secret" >> .env
echo "REDDIT_USER_AGENT=your_user_agent" >> .env
```

## 💻 Usage

### Data Collection

**Reddit Scraper** (Currently Active):
```bash
cd scrapers
python reddit_scraper.py
```

### Data Analysis

**Run Jupyter Notebooks**:
```bash
cd notebook
jupyter notebook
```

Navigate through the notebooks in order:
1. `1.EDA.ipynb` - Explore the collected data
2. `2.Preprocessing.ipynb` - Clean and prepare data
3. `3.Model_Training.ipynb` - Train baseline models
4. `4.Results_Analysis.ipynb` - Analyze and visualize results

### Backend API

```bash
cd backend
python main.py
```

## 📊 Data Sources

### Reddit (Active)
- **Subreddits Targeted**: 
  - r/diabetes, r/type2diabetes
  - r/loseit, r/nutrition, r/EatingDisorders
  - r/Fitness, r/bodyweightfitness
  - r/mentalhealth, r/depression, r/anxiety
  - r/sleep, r/insomnia
  - r/stopdrinking, r/leaves (cannabis)
  
- **Data Collected**: ~19,000 posts
- **Fields**: Title, text content, timestamp, score, comments

### Twitter (Planned)
- Health-related hashtags
- User conversations
- Sentiment analysis

### YouTube (Planned)
- Health channel comments
- Video transcripts
- Engagement metrics

## 🔬 Methodology

### 1. Data Collection
- Web scraping using platform APIs
- Multi-threaded collection for efficiency
- Rate limiting and ethical scraping practices

### 2. Preprocessing
- Text cleaning (URLs, special characters, HTML tags)
- Tokenization and lemmatization
- Stopword removal
- Handling Reddit-specific elements ([deleted], [removed])

### 3. Feature Engineering
- TF-IDF vectorization
- Word embeddings (Word2Vec, GloVe)
- Sentiment analysis
- Named Entity Recognition (NER)
- Topic modeling

### 4. Model Development
- **Baseline Models**: Logistic Regression, Random Forest, SVM
- **Deep Learning**: LSTM, CNN for text
- **Transformers**: BERT, RoBERTa for context understanding

### 5. Risk Assessment
- Multi-label classification
- Risk score calculation
- Confidence intervals

## 📈 Results

**Current Status**: Initial data collection phase completed

- ✅ Successfully scraped 19,000+ Reddit posts
- ✅ Established data collection pipeline
- 🔄 EDA in progress
- 🔄 Baseline model development underway

Detailed results will be updated after model training and evaluation.

## 🔮 Future Work

### Short-term (1-2 months)
- [ ] Complete Twitter and YouTube scrapers
- [ ] Implement advanced preprocessing techniques
- [ ] Train and evaluate deep learning models
- [ ] Develop risk scoring algorithms
- [ ] Create interactive visualization dashboard

### Long-term (3-6 months)
- [ ] Real-time monitoring system
- [ ] Mobile application integration
- [ ] Personalized risk assessment
- [ ] Integration with healthcare platforms
- [ ] Multi-language support

## 📅 Timeline

### Phase 1: Data Collection (Weeks 1-2) ✅
- ✅ Reddit scraper implementation
- ✅ Initial data collection (19K posts)
- 🔄 Twitter and YouTube scrapers

### Phase 2: Analysis & Preprocessing (Weeks 3-4) 🔄
- 🔄 Exploratory Data Analysis
- 🔄 Data cleaning and preprocessing
- 🔄 Feature extraction pipeline

### Phase 3: Model Development (Weeks 5-8)
- Baseline model training
- Deep learning model implementation
- Hyperparameter tuning
- Model evaluation

### Phase 4: Deployment & Refinement (Weeks 9-12)
- API development
- Frontend integration
- Testing and validation
- Documentation

### Key Milestones
- **Week 2**: Intermediate Review #1 ⏰ (5-6 days from now)
- **Week 12**: Final Review & Presentation

## 🤝 Contributing

This is an academic capstone project. For questions or suggestions:

**Author**: [Your Name]  
**Institution**: [Your University]  
**Email**: [Your Email]  
**LinkedIn**: [Your LinkedIn Profile]

## 📝 License

This project is for academic purposes. Please contact the author for usage rights.

## 🙏 Acknowledgments

- Reddit API for data access
- Open-source NLP libraries (spaCy, NLTK, transformers)
- Academic advisors and reviewers

---

**Last Updated**: January 2026  
**Version**: 0.1.0 (Development)

## 📞 Contact & Support

For issues, questions, or collaboration:
- Open an issue in the repository
- Email: [your-email]
- Office Hours: [if applicable]

---

⭐ **Star this repository** if you find it useful!