"""
Vercel Serverless Function (Python)
POST /api/generate-illustration

Body:  { "title": str, "date": "YYYY-MM-DD", "content": str, "styles": [str, ...] }
200 -> { "image": "data:image/png;base64,...." }
4xx/5xx -> { "error": "사람이 읽을 수 있는 한국어 에러 메시지" }

Requires the GEMINI_API_KEY environment variable to be set in the Vercel
project settings (Project -> Settings -> Environment Variables). Never
hard-code the key here or log it.
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import base64

STYLE_PROMPTS = {
    "카툰": "flat cartoon illustration, bold clean outlines, simple shapes",
    "반실사": "semi-realistic digital painting, soft realistic shading with illustrative simplification",
    "수채화": "soft watercolor painting, gentle color bleeds, visible paper texture",
    "애니메이션": "Japanese anime-style illustration, expressive linework, cel shading",
    "3D": "3D rendered illustration, soft studio lighting, stylized clay-like render",
}

MAX_CONTENT_CHARS = 2000
MODEL_NAME = "gemini-2.5-flash-image"  # current Gemini image-generation model


def build_prompt(title, content, styles):
    style_descriptions = [STYLE_PROMPTS.get(s, s) for s in styles]
    style_line = ", ".join(style_descriptions) if style_descriptions else "warm minimal illustration"
    trimmed = content.strip()[:MAX_CONTENT_CHARS]
    return (
        "Create a single square diary illustration that captures the mood and key scene "
        f'of this personal diary entry titled "{title.strip()}".\n\n'
        f"Diary entry:\n{trimmed}\n\n"
        f"Visual style: {style_line}.\n"
        "No embedded text, letters, captions, or watermarks anywhere in the image. "
        "Warm, cozy, gentle color palette. Suitable for all audiences."
    )


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        # ---- parse request body ----
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b""
            data = json.loads(raw or b"{}")
        except (ValueError, json.JSONDecodeError):
            self._send_json(400, {"error": "요청 형식이 올바르지 않습니다."})
            return

        title = (data.get("title") or "").strip()
        content = (data.get("content") or "").strip()
        styles = data.get("styles") or []

        # ---- validation: empty input ----
        if not content:
            self._send_json(400, {"error": "일기 내용이 비어 있어요. 먼저 일기를 작성해주세요."})
            return
        if not isinstance(styles, list) or not (1 <= len(styles) <= 5):
            self._send_json(400, {"error": "스타일을 1개에서 5개까지 선택해주세요."})
            return

        # ---- config ----
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            self._send_json(500, {"error": "서버에 GEMINI_API_KEY가 설정되어 있지 않습니다."})
            return

        try:
            from google import genai
            from google.genai import types
        except ImportError:
            self._send_json(500, {"error": "이미지 생성 라이브러리를 불러오지 못했습니다."})
            return

        prompt = build_prompt(title, content, styles)

        # ---- call Gemini ----
        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"],
                ),
            )
        except Exception as exc:  # covers network errors, 4xx/5xx from Gemini, timeouts raised by the SDK
            self._send_json(502, {"error": f"이미지 생성 중 오류가 발생했어요: {exc}"})
            return

        # ---- extract the generated image ----
        image_b64 = None
        mime_type = "image/png"
        try:
            for part in response.candidates[0].content.parts:
                if getattr(part, "inline_data", None) is not None:
                    image_b64 = base64.b64encode(part.inline_data.data).decode("utf-8")
                    mime_type = part.inline_data.mime_type or mime_type
                    break
        except (AttributeError, IndexError):
            pass

        if not image_b64:
            self._send_json(502, {"error": "모델이 이미지를 반환하지 않았어요. 다시 시도해주세요."})
            return

        self._send_json(200, {"image": f"data:{mime_type};base64,{image_b64}"})

    def do_GET(self):
        self._send_json(405, {"error": "POST 요청만 지원합니다."})
