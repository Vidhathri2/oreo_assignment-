import re

title = "Harry Potter and the Sorcerer's Stone"
escaped_title = title.replace("'", "\\\\'")
html = f'''<div class="recent-action" style="cursor:pointer;" onclick="openReturnModal(1, '{escaped_title}', 1)" title="Return Book">'''

print("HTML:", html)
