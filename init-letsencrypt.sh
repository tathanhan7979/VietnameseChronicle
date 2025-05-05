#!/bin/bash

if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

domains=(lichsuviet.edu.vn www.lichsuviet.edu.vn)
email="your-email@example.com" # Thay đổi thành email của bạn

data_path="./certbot"
rsa_key_size=4096

if [ -d "$data_path" ]; then
  read -p "Chứng chỉ SSL hiện đã tồn tại. Bạn có muốn tạo lại không? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Tải các tham số SSL mẫu..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Tạo thư mục cho domain..."
for domain in "${domains[@]}"; do
  mkdir -p "$data_path/conf/live/$domain"
  mkdir -p "$data_path/www"
done
echo

echo "### Tạo cấu hình nginx dạng dummy..."
path="/etc/letsencrypt/live/${domains[0]}"
mkdir -p "$data_path/conf/live/${domains[0]}"

cat > "$data_path/conf/live/${domains[0]}/cert.pem" << EOL
-----BEGIN CERTIFICATE-----
MIIEhjCCA26gAwIBAgIEKutbUjANBgkqhkiG9w0BAQsFADB3MRkwFwYDVQQDDBBk
dW1teS1jZXJ0aWZpY2F0ZTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMQswCQYD
VQQHDAJMQTEYMBYGA1UECgwPTGljaFN1VmlldC5lZHUudk4xFTATBgNVBAsMDElU
IERlcGFydG1lbnQwHhcNMjIwMTAxMDAwMDAwWhcNMjMwMTAxMDAwMDAwWjB3MRkw
FwYDVQQDDBBkdW1teS1jZXJ0aWZpY2F0ZTELMAkGA1UEBhMCVVMxCzAJBgNVBAgM
AkNBMQswCQYDVQQHDAJMQTEYMBYGA1UECgwPTGljaFN1VmlldC5lZHUudk4xFTAT
BgNVBAsMDElUIERlcGFydG1lbnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
AoIBAQC3eD8JdF5KGEIXltS/F1GN1RgDKb1qyXw2g0Z0M9+N26SRRSt6YQDQu2Tl
VtB5HEgSwBXwZ3OhfEqEZjHQIPHO4JGD0fkv5q7A
-----END CERTIFICATE-----
EOL

cat > "$data_path/conf/live/${domains[0]}/privkey.pem" << EOL
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3eD8JdF5KGEEbH
ytJLkqrGJAjUSDnwCHQy4NCSRErERRQaKuiG5sj5RSLJzRs8CZP+1XNg/J0nq+Bqr
YB9yE+tYz5TYBzi6PmjnZjRH//IcHG6VGhHa+O8c+o0SkLpJ0rpHhZxz6AfEV2lx
lZnWjH9Cc+YKf85YOjZGBORqNu4PB7TvfpWA8mDXMKBNMLX5kH5xqjQQDbDuZkwZ
H6DfwbVyf98Mq1Ip4bGX3LegVRaZN+NhiGHvE
-----END PRIVATE KEY-----
EOL

cat > "$data_path/conf/live/${domains[0]}/fullchain.pem" << EOL
-----BEGIN CERTIFICATE-----
MIIEhjCCA26gAwIBAgIEKutbUjANBgkqhkiG9w0BAQsFADB3MRkwFwYDVQQDDBBk
dW1teS1jZXJ0aWZpY2F0ZTELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMQswCQYD
VQQHDAJMQTEYMBYGA1UECgwPTGljaFN1VmlldC5lZHUudk4xFTATBgNVBAsMDElU
IERlcGFydG1lbnQwHhcNMjIwMTAxMDAwMDAwWhcNMjMwMTAxMDAwMDAwWjB3MRkw
FwYDVQQDDBBkdW1teS1jZXJ0aWZpY2F0ZTELMAkGA1UEBhMCVVMxCzAJBgNVBAgM
AkNBMQswCQYDVQQHDAJMQTEYMBYGA1UECgwPTGljaFN1VmlldC5lZHUudk4xFTAT
BgNVBAsMDElUIERlcGFydG1lbnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
AoIBAQC3eD8JdF5KGEIXltS/F1GN1RgDKb1qyXw2g0Z0M9+N26SRRSt6YQDQu2Tl
VtB5HEgSwBXwZ3OhfEqEZjHQIPHO4JGD0fkv5q7A
-----END CERTIFICATE-----
EOL

echo

echo "### Khởi động nginx..."
docker-compose up -d nginx
echo

echo "### Xóa chứng chỉ dummy và tạo chứng chỉ mới..."
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot \
  --email $email \
  -d ${domains[0]} -d ${domains[1]} \
  --rsa-key-size $rsa_key_size \
  --agree-tos \
  --force-renewal
echo

echo "### Khởi động lại nginx..."
docker-compose restart nginx
