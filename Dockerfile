# Use official Python image
FROM python:3.11-slim

# Prevents Python from buffering outputs (for logs)
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

# Copy Django project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Start Gunicorn
CMD ["gunicorn", "ScanGo.wsgi:application", "--bind", "0.0.0.0:8000"]
