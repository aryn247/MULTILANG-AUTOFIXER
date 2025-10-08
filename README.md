Multi-Language Real-Time Syntax Auto-Fixer

A Visual Studio Code extension that automatically detects and fixes common syntax errors in real time while you type.
Powered by Tree-sitter, it supports multiple languages with a single lightweight parsing engine.

✨ Features

🔥 Real-Time Fixes – Automatically corrects frequent syntax mistakes as you type.

🌍 Multi-Language Support – Works with:

Python 🐍

JavaScript ⚡

Java ☕

C 🔧

C++ 🚀

Ruby 💎

Rust 🦀

PHP 🐘

Go 🐹

⚡ Powered by Tree-sitter – Fast, incremental parsing for smooth performance.

📝 Productivity Booster – Reduce debugging interruptions caused by typos and missing punctuation.

🛠 Customizable – Enable/disable the auto-fixer or tweak rules per language.


📦 Requirements

VS Code 1.XX.X or higher

Node.js >=14.x (recommended for building & running Tree-sitter parsers)

⚙ Extension Settings

This extension contributes the following settings:

autoFixSyntax.enable → Enable/Disable auto-fix globally

(planned) autoFixSyntax.log → Show applied fixes in an on-screen log

(planned) autoFixSyntax.languages → Customize enabled languages

🐞 Known Issues

Some advanced syntax errors may not yet be recognized.

Auto-fixes are rule-based — edge cases may require manual correction.

👉 Please report issues on the GitHub Issues page
.

📜 Release Notes
1.0.0

Initial release with support for Python, JavaScript, Java, C, C++, Ruby, Rust, PHP, and Go.

Real-time auto-fixes powered by Tree-sitter.

Configurable global enable/disable option.

🗺 Roadmap

 Add support for additional languages (C#, TypeScript, Kotlin, etc.)

 Provide per-language rule customization

 Allow users to view fix history in output panel

🙌 Contributing

Pull requests are welcome!

Fork the repo

Create a feature branch

Submit a PR after testing

Please open an issue first to discuss your ideas.

📜 License

This project is licensed under the MIT License.