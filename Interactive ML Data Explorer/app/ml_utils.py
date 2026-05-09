import pandas as pd
import numpy as np
import json

from sklearn.preprocessing import StandardScaler

from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, accuracy_score, f1_score

from sklearn.linear_model import LinearRegression, Ridge, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier

import plotly.graph_objects as go

# load csv as df
def load_csv_df(file):
    return pd.read_csv(file)

def get_variables(df):
    return df.columns.tolist()

# feature typing
def data_preprocessing(df):
    # clean data, na value handling

    # identify cols as numerical or categorical
    def mark_cols(df, heuristic=10):
        
        # basic criteria for categorical
        cat_cols = set(df.select_dtypes(include=["string", "object", "category"]).columns.tolist())
        for col in df.columns:
            
            if df[col].nunique() < heuristic:
                cat_cols.add(col)
        
        cat_cols = list(cat_cols)
        
        for col in cat_cols:
            
            # creates a normalized set of the unique categorical values
            values = df[col].astype(str).str.lower().unique()
            
            # checks whether certain strings are subsets of values and maps accordingly
            if set(values).issubset({"yes", "no"}):
                df[col] = df[col].str.lower().map({"yes": 1, "no": 0})
            elif set(values).issubset({"true", "false"}):
                df[col] = df[col].str.lower().map({"true": 1, "false": 0})   
            elif set(values).issubset({"y", "n"}):
                df[col] = df[col].str.lower().map({"y": 1, "n": 0})
        
        # basic criteria for numerical 
        num_cols = df.select_dtypes(include="number").columns.tolist()
        num_cols = [col for col in num_cols if col not in cat_cols]
        marked_df = df
        
        return cat_cols, num_cols, marked_df
    
    
    
    def clean_data(df, cat_cols):
        
        # drops any id cols as they are usally not relevant in finding relationships
        id_cols = [col for col in df.columns if col.lower() == "id" or col.endswith("_id")]
        df = df.drop(id_cols)
        
        for col in df.columns:
            
            if col in cat_cols:
                df[col] = df[col].fillna("Missing")   
        
        cleaned_df = df
        return cleaned_df
    
    # func calls
    cat_cols, num_cols, marked_df = mark_cols(df)
    cleaned_df = clean_data(marked_df, cat_cols)
            
    return cat_cols, num_cols, cleaned_df

def train_regression(df, num_cols):
    # split data
    # scale
    pass

def train_classification(df, cat_cols):
    # split data
    df = pd.get_dummies(df, columns=cat_cols, dtype=int)    

"""
    def handle_na_values(df, cat_cols, num_cols):
        pass 
   
   def encode_cat_cols(df, cat_cols):
       pass
    # split into categorical and numerical
    # one-hot encoding
    # test train split 
    def scale_num_data():
        pass

"""