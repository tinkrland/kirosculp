#!/usr/bin/env python3
"""check structural integrity of the unapproved routing research pack."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOPIC = ROOT / 'manufacturing/research/topics/order-routing'

def main():
    matrix = json.loads((TOPIC / 'countries.json').read_text())
    index = json.loads((TOPIC / 'sources.json').read_text())
    countries = matrix['countries']
    source_ids = {s['source_id'] for s in index['sources']}
    expected = {'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'NL', 'ES', 'BE', 'AT',
                'CH', 'SE', 'DK', 'IE', 'NZ', 'JP', 'KR', 'SG', 'AE', 'NO', 'IL'}
    members = {'GB', 'IT', 'NL', 'AT', 'CH', 'SE', 'DK', 'IE', 'NO', 'IL'}
    assert len(countries) == matrix['country_count'] == 22
    assert {c['country_code'] for c in countries} == expected
    assert {c['country_code'] for c in countries if c['convention_member']} == members
    assert sum(c['eu_member'] for c in countries) == 10
    assert sum(c['planned_rollout'] == 'first cohort' for c in countries) == 16
    assert sum(c['planned_rollout'] == 'research hold' for c in countries) == 5
    assert sum(c['planned_rollout'] == 'v3 candidate' for c in countries) == 1
    assert len(source_ids) == index['source_count'] == len(index['sources'])
    assert index['full_text_republication'] is False
    for country in countries:
        assert country['checkout_enabled'] is False
        assert country['hallmarking_review'] == 'unapproved research'
        assert country['import_review'] == 'unapproved research'
        assert set(country['evidence_source_ids']) <= source_ids
        assert country['membership_source_id'] in source_ids
        if 'convention_profile' in country:
            profile = country['convention_profile']
            assert profile['source_id'] in source_ids
            assert profile['source_is_informational_not_legal'] is True
            assert profile['raw_weight_cells_are_not_executable_predicates'] is True
            assert profile['office_appointment_scope_and_current_service_not_verified'] is True
            assert set(profile['fineness_per_thousand_reported']) == {'gold', 'silver', 'platinum', 'palladium'}
    by_code = {c['country_code']: c for c in countries}
    assert by_code['NO']['eea_non_eu'] and not by_code['NO']['eu_member']
    assert by_code['CH']['efta_member'] and not by_code['CH']['eea_non_eu']
    assert not by_code['GB']['eu_member']
    assert by_code['DE']['eu_member'] and not by_code['DE']['convention_member']
    assert '2g' in by_code['IL']['convention_profile']['weight_exemption_cells_raw']['gold']
    print('passed: 22 countries, two independent unapproved axes, all sources resolve, checkout closed')

if __name__ == '__main__':
    main()
