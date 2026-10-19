from rest_framework.pagination import CursorPagination


class FeedCursorPagination(CursorPagination):
    """Newest-first pages of posts for the infinite-scrolling feeds.

    A cursor (rather than page numbers) keeps pages stable while new posts
    arrive: a page continues after the last post the client has, so nothing
    is shown twice or skipped. `id` breaks ties between equal timestamps.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50
    ordering = ("-created_at", "-id")
