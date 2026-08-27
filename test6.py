import json

tx = {
    "book": {"id": 1, "title": "Harry Potter"},
    "borrower": {"id": 1}
}
isReturn = False

html = f'''<div class="recent-action" {'style="cursor:pointer;" onclick="quickReturn(' + str(tx['book']['id']) + ', ' + str(tx['borrower']['id']) + ')" title="Return Book"' if not isReturn else ''}>
    <i>icon</i>
</div>'''

print(html)
