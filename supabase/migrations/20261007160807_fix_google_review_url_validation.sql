alter table public.restaurants drop constraint google_review_url_safe;
alter table public.restaurants add constraint google_review_url_safe check(google_review_url is null or (length(google_review_url)<=1800 and google_review_url ~ '^https://(search[.]google[.]com|maps[.]google[.]com|www[.]google[.]com|g[.]page|maps[.]app[.]goo[.]gl)/[^[:space:]]+$'));
