module.exports = {
    apps: [
        {
            name: "biogance web",
            script: "npm",
            args: "start",
            cwd: "/var/www/biogance-web",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            }
        }
    ]
}