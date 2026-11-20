FROM alpine:3.20
ARG PB_VERSION=0.40.6
ARG TARGETARCH
RUN apk add --no-cache ca-certificates unzip wget \
 && arch="${TARGETARCH}" \
 && if [ -z "$arch" ]; then case "$(uname -m)" in aarch64) arch=arm64 ;; x86_64) arch=amd64 ;; *) exit 1 ;; esac; fi \
 && mkdir -p /pb \
 && wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${arch}.zip -O /tmp/pocketbase.zip \
 && unzip /tmp/pocketbase.zip -d /pb \
 && rm /tmp/pocketbase.zip
EXPOSE 8090
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]
