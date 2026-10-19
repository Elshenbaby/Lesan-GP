class ScopedQuerysetMixin:
    """Restrict `queryset` to what the requesting user may see via `scope()`.

    OpenAPI schema generation calls get_queryset() without a real user, so it gets an empty queryset instead.
    """

    def scope(self, queryset, user):
        raise NotImplementedError

    def get_queryset(self):
        queryset = super().get_queryset()
        if getattr(self, "swagger_fake_view", False):
            return queryset.none()
        return self.scope(queryset, self.request.user)
