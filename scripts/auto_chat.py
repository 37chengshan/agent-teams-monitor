import json
import time
import os
from datetime import datetime

alice_file = os.path.expanduser("~/.claude/teams/test-auto-team/inboxes/alice.json")
bob_file = os.path.expanduser("~/.claude/teams/test-auto-team/inboxes/bob.json")

messages = [
    "Hello from Alice",
    "Hello from Bob",
    "Testing message 1",
    "Testing message 2",
    "Message system OK",
    "Great!",
    "More messages",
    "Keep going",
    "Almost done",
    "Final test"
]

def load_messages(filepath):
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if content and content != "[]":
                try:
                    return json.loads(content)
                except:
                    return []
    return []

def save_messages(filepath, messages):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)

print("Starting auto chat...")

count = 0
while True:
    msg_text = messages[count % len(messages)]
    sender = "alice" if count % 2 == 0 else "bob"
    color = "blue" if sender == "alice" else "green"
    filepath = alice_file if sender == "alice" else bob_file

    msg = {
        "from": sender,
        "text": msg_text,
        "summary": f"Message from {sender}",
        "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "color": color,
        "read": False
    }

    msgs = load_messages(filepath)
    msgs.append(msg)
    save_messages(filepath, msgs)

    print(f"  {sender}: {msg_text}")

    count += 1
    time.sleep(3)
