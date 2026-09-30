#!/usr/bin/env python3
"""collect dated routing evidence through configured research services."""
import argparse
import concurrent.futures
import datetime
import json
import io
import os
import threading
import time
from pathlib import Path
import urllib.error
import urllib.request


_SERVICE_LOCK = threading.Lock()
_LAST_SERVICE_REQUEST = 0.0

def collect(job, output, observed_on):
    kind, label, value = job['kind'], job['id'], job['value']
    record = {'id': label, 'kind': kind, 'input': value, 'observed_on': observed_on}
    try:
        if kind == 'tavily':
            endpoint = 'https://api.tavily.com/search'
            payload = {'api_key': os.environ['TAVILY_API_KEY'], 'query': value,
                       'search_depth': 'advanced', 'max_results': job.get('limit', 5)}
            if job.get('domains'):
                payload['include_domains'] = job['domains']
            headers = {'Content-Type': 'application/json'}
        elif kind == 'alexandria':
            endpoint = 'https://api.firecrawl.dev/v2/search'
            payload = {'query': value, 'sources': ['alexandria'], 'limit': job.get('limit', 3)}
            headers = {'Authorization': 'Bearer ' + os.environ['FIRECRAWL_API_KEY'],
                       'Content-Type': 'application/json'}
        elif kind == 'firecrawl':
            endpoint = 'https://api.firecrawl.dev/v2/scrape'
            payload = {'url': value, 'formats': ['markdown'], 'onlyMainContent': True,
                       'timeout': 60000}
            headers = {'Authorization': 'Bearer ' + os.environ['FIRECRAWL_API_KEY'],
                       'Content-Type': 'application/json'}
        elif kind == 'direct':
            from bs4 import BeautifulSoup
            from pypdf import PdfReader
            request = urllib.request.Request(value, headers={'User-Agent': 'Mozilla/5.0 (compatible; routing-research/1.0)'})
            with urllib.request.urlopen(request, timeout=60) as response:
                body = response.read()
                content_type = response.headers.get('Content-Type', '')
                final_url = response.url
            tables = []
            if body.startswith(b'%PDF'):
                text = '\n\n'.join(page.extract_text() or '' for page in PdfReader(io.BytesIO(body)).pages)
                title = 'pdf document'
            else:
                soup = BeautifulSoup(body, 'html.parser')
                title = soup.title.get_text(' ', strip=True) if soup.title else ''
                if 'hallmarkingconvention.org' in value and '/country-profile/' in value:
                    tables = [[[cell.get_text(' ', strip=True) for cell in row.find_all(['th', 'td'])]
                               for row in table.find_all('tr')] for table in soup.find_all('table')]
                for element in soup(['script', 'style', 'noscript']):
                    element.decompose()
                text = soup.get_text('\n', strip=True)
            usable = bool(text.strip()) and 'page not found' not in title.lower()
            record['response'] = {'success': usable, 'data': {'markdown': text, 'metadata':
                {'sourceURL': value, 'finalURL': final_url, 'contentType': content_type, 'title': title}}}
            if tables:
                record['response']['data']['tables'] = tables
            (output / (label + '.json')).write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
            return record
        else:
            raise ValueError('unsupported evidence service')
        if kind in ('firecrawl', 'alexandria'):
            global _LAST_SERVICE_REQUEST
            with _SERVICE_LOCK:
                delay = 7.0 - (time.monotonic() - _LAST_SERVICE_REQUEST)
                if delay > 0:
                    time.sleep(delay)
                _LAST_SERVICE_REQUEST = time.monotonic()
        request = urllib.request.Request(endpoint, data=json.dumps(payload).encode(), headers=headers)
        with urllib.request.urlopen(request, timeout=90) as response:
            record['response'] = json.load(response)
    except urllib.error.HTTPError as error:
        record['error'] = {'http_status': error.code, 'body': error.read().decode()}
    except Exception as error:
        record['error'] = {'type': type(error).__name__, 'message': str(error)}
    (output / (label + '.json')).write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--observed-on', default=datetime.date.today().isoformat())
    parser.add_argument('--workers', type=int, default=6)
    args = parser.parse_args()
    jobs = json.loads(args.manifest.read_text())
    ids = [j['id'] for j in jobs]
    if len(ids) != len(set(ids)):
        raise ValueError('duplicate source identifiers')
    args.output.mkdir(parents=True, exist_ok=True)
    for label in ids:
        if (args.output / (label + '.json')).exists():
            raise ValueError('refusing to overwrite an existing source snapshot: ' + label)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        for result in pool.map(lambda job: collect(job, args.output, args.observed_on), jobs):
            response = result.get('response', {})
            data = response.get('data', {})
            markdown = data.get('markdown', '') if isinstance(data, dict) else ''
            print(result['id'], 'error' if result.get('error') else 'saved',
                  'characters=' + str(len(markdown)),
                  'results=' + str(len(response.get('results', []))), flush=True)


if __name__ == '__main__':
    main()
