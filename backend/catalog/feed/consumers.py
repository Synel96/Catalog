import json
from channels.generic.websocket import AsyncWebsocketConsumer

class FeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("feed_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("feed_updates", self.channel_name)

   

    async def send_post_update(self, event):
        try:
            print("📡 WS küldés indul:", event)

            await self.send(text_data=json.dumps({
                "type": "post_update",
                "message": event.get("message", "Nincs üzenet"),
                "overlord": event.get("overlord", None),
                "post_id": event.get("post_id", None),
            }))
        except Exception as e:
            print("❌ HIBA a send_post_update-ben:", str(e))