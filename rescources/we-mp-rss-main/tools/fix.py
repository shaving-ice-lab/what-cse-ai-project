import copy
from core.models.article import Article
def fix_html(content:str):
    from core.content_format import format_content
    from tools.mdtools.md2html import convert_markdown_to_html
    from tools.html import htmltools
    htmltools.clean_html(content,remove_attributes= [{'src': ''}],remove_ids=['content_bottom_interaction','activity-name','meta_content'])
    content=format_content(content,content_format='markdown')
    content=convert_markdown_to_html(content)
    return content
def fix_article(article):
    art=article.to_dict()
    art['content']=fix_html(art['content'])
    return art