FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir requests psutil
# IA local (torch/transformers, ~1GB) só se pedir: docker build --build-arg INSTALL_LOCAL_AI=1 .
ARG INSTALL_LOCAL_AI=0
RUN if [ "$INSTALL_LOCAL_AI" = "1" ]; then \
      pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
      pip install --no-cache-dir transformers accelerate; \
    fi
ENV DISABLE_LOCAL_AI=true PYTHONUNBUFFERED=1
COPY . .
EXPOSE 8080
CMD ["python3", "cookie_ide_app.py"]
