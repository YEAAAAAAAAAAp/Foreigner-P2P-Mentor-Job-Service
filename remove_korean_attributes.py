#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import os

def remove_korean_attributes(file_path):
    """Remove data-ko and data-en attributes from HTML file, keeping only English content"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match data-ko="..." data-en="..." attributes and keep only the English text
    pattern = r'data-ko="[^"]*"\s+data-en="([^"]*)"'
    content = re.sub(pattern, '', content)
    
    # Pattern to match data-en="..." data-ko="..." attributes and keep only the English text  
    pattern2 = r'data-en="([^"]*?)"\s+data-ko="[^"]*"'
    content = re.sub(pattern2, '', content)
    
    # Remove standalone data-ko attributes
    pattern3 = r'\s*data-ko="[^"]*"'
    content = re.sub(pattern3, '', content)
    
    # Remove standalone data-en attributes  
    pattern4 = r'\s*data-en="[^"]*"'
    content = re.sub(pattern4, '', content)
    
    # Clean up any double spaces that might have been created
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'>\s+<', '><', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Successfully removed Korean language attributes from {file_path}")

if __name__ == "__main__":
    html_file = "index.html"
    if os.path.exists(html_file):
        remove_korean_attributes(html_file)
    else:
        print(f"File {html_file} not found!")