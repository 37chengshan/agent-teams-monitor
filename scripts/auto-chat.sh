#!/bin/bash
# 自动聊天脚本 - 让 Alice 和 Bob 互相发消息

TEAM_DIR="$HOME/.claude/teams/test-auto-team/inboxes"
ALICE_FILE="$TEAM_DIR/alice.json"
BOB_FILE="$TEAM_DIR/bob.json"

echo "🤖 开始自动聊天测试..."
echo "📁 监控目录: $TEAM_DIR"

# 初始化消息数组
initialize_messages() {
    echo "[]" > "$ALICE_FILE"
    echo "[]" > "$BOB_FILE"
}

# 添加 Alice 的消息
add_alice_message() {
    local text="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local msg="{\"from\": \"alice\", \"text\": \"$text\", \"summary\": \"Message from alice\", \"timestamp\": \"$timestamp\", \"color\": \"blue\", \"read\": false}"

    # 读取现有消息，添加新消息
    local existing=$(cat "$ALICE_FILE" 2>/dev/null || echo "[]")
    if [ "$existing" = "[]" ]; then
        echo "[$msg]" > "$ALICE_FILE"
    else
        # 移除最后的 ]，添加新消息和 ]
        existing=${existing%]*}
        echo "${existing},$msg]" > "$ALICE_FILE"
    fi
    echo "  📤 Alice: $text"
}

# 添加 Bob 的消息
add_bob_message() {
    local text="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    local msg="{\"from\": \"bob\", \"text\": \"$text\", \"summary\": \"Message from bob\", \"timestamp\": \"$timestamp\", \"color\": \"green\", \"read\": false}"

    local existing=$(cat "$BOB_FILE" 2>/dev/null || echo "[]")
    if [ "$existing" = "[]" ]; then
        echo "[$msg]" > "$BOB_FILE"
    else
        existing=${existing%]*}
        echo "${existing},$msg]" > "$BOB_FILE"
    fi
    echo "  📤 Bob: $text"
}

# 聊天内容
MESSAGES=(
    "你好！我是 Alice"
    "你好 Alice！我是 Bob"
    "今天天气不错"
    "是啊，适合写代码"
    "我们测试一下消息系统"
    "好的，我来发送一条"
    "收到！消息传递正常"
    "太棒了！监控系统工作正常"
    "再来一条测试"
    "这是第10条消息"
)

# 初始化
initialize_messages

# 循环发送消息
count=0
while true; do
    idx=$((count % ${#MESSAGES[@]}))
    sender=$((count % 2))

    if [ $sender -eq 0 ]; then
        add_alice_message "${MESSAGES[$idx]}"
    else
        add_bob_message "${MESSAGES[$idx]}"
    fi

    count=$((count + 1))
    sleep 3
done
