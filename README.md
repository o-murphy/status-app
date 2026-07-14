### Installation

```bash
docker build -t o-murphy-status-app-container
docker run -d -p 3000:80 --name o-murphy-status-app-container o-murphy-status-app
```

```DockerCompose
  status:
    build: ./status-app  # Path to the directory containing your Dockerfile
    container_name: o-murphy-status-app-container
    restart: always
    networks:
      - nginx-proxy-network
```



## Getting Started

This is a plain TypeScript + [Vite](https://vite.dev) + [Tailwind CSS](https://tailwindcss.com) app (no React).

Install dependencies and run the dev server:

```bash
yarn install
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

Build for production (outputs to `dist/`):

```bash
yarn build
```
