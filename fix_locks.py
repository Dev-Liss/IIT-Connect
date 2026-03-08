"""Strip merge conflict markers from lock files, keeping HEAD side."""
import re

def take_head_side(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Replace each conflict block, keeping only HEAD side
    result = re.sub(
        r'<<<<<<< HEAD\n(.*?)=======\n.*?>>>>>>> origin/chanul-messages\n',
        r'\1',
        content,
        flags=re.DOTALL
    )
    with open(path, 'w', encoding='utf-8') as f:
        f.write(result)
    remaining = result.count('<<<<<<<')
    print(f'Fixed {path} (remaining conflicts: {remaining})')

take_head_side('backend/package-lock.json')
take_head_side('mobile-app/package-lock.json')
print('All done.')
