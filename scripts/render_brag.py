#!/usr/bin/env python3
"""
StudyMate - High Performance Brag Video Renderer
Generates 1920x1080 30fps motion graphics and renders with FFmpeg + music bed.
"""

import os
import sys
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_SECONDS = 18.0
TOTAL_FRAMES = int(FPS * TOTAL_SECONDS)  # 540 frames

WORK_DIR = os.path.abspath("brag-output/work")
OUTPUT_VIDEO = os.path.abspath("brag-output/brag.mp4")
OUTPUT_POSTER = os.path.abspath("brag-output/brag.jpg")
MUSIC_TRACK = r"C:\Users\Hp\.gemini\config\skills\brag\assets\music\happy-beats-business-moves-vol-1-by-ende-dot-app.mp3"

os.makedirs(WORK_DIR, exist_ok=True)

# Load Windows System Fonts
def get_font(size, bold=False, mono=False):
    try:
        if mono:
            return ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", size)
        elif bold:
            return ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", size)
        else:
            return ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", size)
    except Exception:
        return ImageFont.load_default()

font_hero = get_font(72, bold=True)
font_title = get_font(52, bold=True)
font_subtitle = get_font(32, bold=False)
font_badge = get_font(22, bold=True)
font_card_title = get_font(28, bold=True)
font_card_body = get_font(24, bold=False)
font_card_sub = get_font(20, bold=False)
font_timer = get_font(84, bold=True, mono=True)
font_code = get_font(22, bold=False, mono=True)

def ease_out_cubic(x):
    return 1.0 - math.pow(1.0 - x, 3)

def ease_in_out_quad(x):
    return 2 * x * x if x < 0.5 else 1 - math.pow(-2 * x + 2, 2) / 2

def draw_rounded_rect(draw, bbox, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = bbox
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_background(draw, frame_idx):
    # Deep Dark Slate Base
    bg_color = (11, 19, 43)
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=bg_color)

    # Ambient radial cyan/blue pulse in center
    t = frame_idx / float(TOTAL_FRAMES)
    pulse = (math.sin(t * 12.0) + 1.0) * 0.5
    center_x = WIDTH // 2
    center_y = HEIGHT // 2
    glow_radius = int(450 + pulse * 60)

    # Draw subtle gradient circles
    for r in range(glow_radius, 150, -40):
        alpha = int(14 * (1.0 - (r - 150) / float(glow_radius - 150)))
        col = (16, 42, 77, alpha)
        # Approximate soft overlay
        draw.ellipse([center_x - r, center_y - r * 0.6, center_x + r, center_y + r * 0.6], fill=(18, 38, 70))

    # Grid dots for tech aesthetics
    grid_spacing = 96
    for x in range(grid_spacing // 2, WIDTH, grid_spacing):
        for y in range(grid_spacing // 2, HEIGHT, grid_spacing):
            draw.point((x, y), fill=(30, 48, 80))

def render_scene_1(img, draw, frame_in_scene, scene_duration):
    """ The Hook: 0.0s - 3.5s (Frames 0 to 105) """
    progress = min(1.0, frame_in_scene / (FPS * 1.2))
    ease = ease_out_cubic(progress)

    # Top Announcement Pill
    pill_y = int(140 - (1.0 - ease) * 40)
    pill_w = 640
    pill_x = (WIDTH - pill_w) // 2
    draw_rounded_rect(draw, [pill_x, pill_y, pill_x + pill_w, pill_y + 44], 22, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    # Pulsing green dot
    draw.ellipse([pill_x + 18, pill_y + 16, pill_x + 30, pill_y + 28], fill=(16, 185, 129))
    draw.text((pill_x + 42, pill_y + 9), "AMAZON ALEXA+ HACKATHON · BUILD, SHIP, SHAPE", fill=(56, 189, 248), font=font_badge)

    # Giant Main Headline
    line1 = "TIRED OF SWITCHING BETWEEN"
    line2 = "40 TABS JUST TO STUDY?"
    y_offset = int(240 + (1.0 - ease) * 60)

    draw.text((WIDTH // 2 - 580, y_offset), line1, fill=(248, 250, 252), font=font_hero)
    draw.text((WIDTH // 2 - 520, y_offset + 95), line2, fill=(56, 189, 248), font=font_hero)

    # Subtitle with fade
    if frame_in_scene > 25:
        sub_ease = ease_out_cubic(min(1.0, (frame_in_scene - 25) / (FPS * 0.8)))
        sub_y = int(480 + (1.0 - sub_ease) * 30)
        draw.text((WIDTH // 2 - 470, sub_y), "Meet StudyMate — The Conversational Academic Co-Pilot.", fill=(148, 163, 184), font=font_subtitle)

    # 3 Floating Value Cards
    if frame_in_scene > 45:
        card_ease = ease_out_cubic(min(1.0, (frame_in_scene - 45) / (FPS * 0.8)))
        cards = [
            ("ZERO SCREEN FATIGUE", "Speak naturally from anywhere in your room", (56, 189, 248)),
            ("ALEXA+ MCP POWERED", "Autonomous tool-calling over Streamable HTTP", (129, 140, 248)),
            ("100% FREE & LOCAL-FIRST", "Native SQLite engine with zero cloud subscriptions", (16, 185, 129)),
        ]
        start_x = 180
        for i, (title, desc, color) in enumerate(cards):
            cx = start_x + i * 530
            cy = int(620 + (1.0 - card_ease) * 50)
            draw_rounded_rect(draw, [cx, cy, cx + 490, cy + 180], 18, fill=(30, 41, 59), outline=color, width=2)
            draw.text((cx + 25, cy + 30), title, fill=color, font=font_card_title)
            draw.text((cx + 25, cy + 85), desc, fill=(226, 232, 240), font=font_card_body)

def render_scene_2(img, draw, frame_in_scene, scene_duration):
    """ Voice Capture in Action: 3.5s - 7.5s (Frames 105 to 225) """
    ease = ease_out_cubic(min(1.0, frame_in_scene / (FPS * 0.8)))

    # Header
    draw.text((WIDTH // 2 - 320, 80), "AMBIENT VOICE CAPTURE", fill=(56, 189, 248), font=font_title)
    draw.text((WIDTH // 2 - 340, 150), "Zero manual typing. Alexa+ extracts intent and calls MCP tools.", fill=(148, 163, 184), font=font_subtitle)

    # Center Voice Waveform Radar
    center_y = 300
    bars = 32
    bar_width = 12
    bar_gap = 14
    total_w = bars * (bar_width + bar_gap)
    start_x = (WIDTH - total_w) // 2

    for b in range(bars):
        # Wave amplitude based on sine & frame
        wave = math.sin((frame_in_scene * 0.25) + (b * 0.45)) * 0.5 + 0.5
        h = int(24 + wave * 90)
        bx = start_x + b * (bar_width + bar_gap)
        by0 = center_y - h // 2
        by1 = center_y + h // 2
        # Gradient color
        c = (56, int(189 + wave * 40), int(248 - wave * 40))
        draw_rounded_rect(draw, [bx, by0, bx + bar_width, by1], 6, fill=c)

    # Student Voice Speech Card
    bubble_y = int(400 + (1.0 - ease) * 40)
    draw_rounded_rect(draw, [300, bubble_y, 1620, bubble_y + 110], 20, fill=(15, 23, 42), outline=(56, 189, 248), width=3)
    draw.text((340, bubble_y + 32), "[VOICE] Student:", fill=(148, 163, 184), font=font_card_title)
    draw.text((550, bubble_y + 30), '"Alexa, what\'s due this week?"', fill=(255, 255, 255), font=font_card_title)

    # Response & Dispatched Tools Card
    if frame_in_scene > 30:
        resp_ease = ease_out_cubic(min(1.0, (frame_in_scene - 30) / (FPS * 0.8)))
        resp_y = int(550 + (1.0 - resp_ease) * 40)
        draw_rounded_rect(draw, [300, resp_y, 1620, resp_y + 380], 20, fill=(30, 41, 59), outline=(129, 140, 248), width=2)
        
        # Tool execution badge
        draw_rounded_rect(draw, [340, resp_y + 25, 780, resp_y + 65], 12, fill=(15, 23, 42), outline=(16, 185, 129), width=1)
        draw.text((355, resp_y + 32), "[MCP ACTION] get_tasks(status='pending')", fill=(16, 185, 129), font=font_code)

        draw.text((340, resp_y + 85), '[ALEXA+] Spoken Response:', fill=(129, 140, 248), font=font_card_title)
        draw.text((340, resp_y + 130), '"Hey Alishba! You have 3 urgent assignments due soon. Your top priority is:"', fill=(248, 250, 252), font=font_card_body)

        # 2 Real tasks
        draw_rounded_rect(draw, [340, resp_y + 185, 1580, resp_y + 260], 12, fill=(15, 23, 42))
        draw.text((365, resp_y + 205), "CS 301 · Problem Set 4: Dynamic Programming & Knapsack", fill=(56, 189, 248), font=font_card_body)
        draw.text((1300, resp_y + 205), "Due Tomorrow · HIGH PRIORITY", fill=(244, 63, 94), font=font_badge)

        draw_rounded_rect(draw, [340, resp_y + 280, 1580, resp_y + 355], 12, fill=(15, 23, 42))
        draw.text((365, resp_y + 300), "CS 420 · Lab 3: Paxos & Raft Consensus Implementation", fill=(16, 185, 129), font=font_card_body)
        draw.text((1340, resp_y + 300), "Due Friday · HIGH PRIORITY", fill=(245, 158, 11), font=font_badge)

def render_scene_3(img, draw, frame_in_scene, scene_duration):
    """ Real-Time Dual-Surface Sync: 7.5s - 11.5s (Frames 225 to 345) """
    ease = ease_out_cubic(min(1.0, frame_in_scene / (FPS * 0.8)))

    draw.text((WIDTH // 2 - 340, 80), "DUAL-SURFACE REAL-TIME SYNC", fill=(56, 189, 248), font=font_title)
    draw.text((WIDTH // 2 - 360, 150), "Voice updates instantly materialize on the web companion dashboard.", fill=(148, 163, 184), font=font_subtitle)

    # Voice command banner
    draw_rounded_rect(draw, [250, 210, 1670, 280], 16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
    draw.text((280, 230), '[VOICE] "Alexa, add task: Finish OS Lab for CS 420, due Friday, high priority"', fill=(248, 250, 252), font=font_card_title)
    draw.text((1440, 233), "add_task · 0.8ms", fill=(16, 185, 129), font=font_code)

    # Left Column: Kanban Live Ingestion
    draw_rounded_rect(draw, [250, 310, 930, 980], 20, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
    draw.text((285, 345), "Live Assignment Pipeline", fill=(248, 250, 252), font=font_card_title)

    # Slide-in animation for the newly added card
    card_slide = ease_out_cubic(min(1.0, frame_in_scene / 35.0))
    ny = int(410 + (1.0 - card_slide) * 60)

    # Newly captured card
    draw_rounded_rect(draw, [285, ny, 895, ny + 140], 14, fill=(15, 23, 42), outline=(56, 189, 248), width=3)
    draw_rounded_rect(draw, [310, ny + 20, 440, ny + 50], 8, fill=(56, 189, 248))
    draw.text((320, ny + 24), "NEW CAPTURE", fill=(15, 23, 42), font=font_badge)
    draw.text((310, ny + 65), "Finish OS Lab: Distributed Virtual Memory", fill=(248, 250, 252), font=font_card_body)
    draw.text((310, ny + 100), "CS 420 Distributed Database Systems · Due Friday", fill=(148, 163, 184), font=font_card_sub)

    # Existing cards
    draw_rounded_rect(draw, [285, 580, 895, 700], 14, fill=(15, 23, 42), outline=(51, 65, 85))
    draw.text((310, 605), "Problem Set 4: Dynamic Programming", fill=(248, 250, 252), font=font_card_body)
    draw.text((310, 645), "CS 301 · In Progress · High Priority", fill=(148, 163, 184), font=font_card_sub)

    draw_rounded_rect(draw, [285, 730, 895, 850], 14, fill=(15, 23, 42), outline=(51, 65, 85))
    draw.text((310, 755), "Eigenvalues Matrix Theory Quiz Prep", fill=(248, 250, 252), font=font_card_body)
    draw.text((310, 795), "MATH 240 · Pending · High Priority", fill=(148, 163, 184), font=font_card_sub)

    # Right Column: Live Course Mastery Progress Grid
    draw_rounded_rect(draw, [990, 310, 1670, 980], 20, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
    draw.text((1025, 345), "Real-Time Course Progress Grid", fill=(248, 250, 252), font=font_card_title)

    courses = [
        ("CS 301 Design & Analysis of Algorithms", 65, (56, 189, 248)),
        ("CS 420 Distributed Database Systems", 40 + int(card_slide * 25), (16, 185, 129)),  # Animates up!
        ("MATH 240 Linear Algebra & Matrix Theory", 80, (129, 140, 248)),
        ("SE 350 Software Architecture & Design", 100, (245, 158, 11)),
    ]

    for j, (cname, pct, color) in enumerate(courses):
        cy = 430 + j * 130
        draw.text((1025, cy), cname, fill=(248, 250, 252), font=font_card_body)
        draw.text((1580, cy), f"{pct}%", fill=color, font=font_card_title)
        # Background bar
        draw_rounded_rect(draw, [1025, cy + 40, 1630, cy + 62], 8, fill=(15, 23, 42))
        # Filled bar
        bar_w = int((1630 - 1025) * (pct / 100.0))
        draw_rounded_rect(draw, [1025, cy + 40, 1025 + bar_w, cy + 62], 8, fill=color)

def render_scene_4(img, draw, frame_in_scene, scene_duration):
    """ Adaptive Pomodoro Focus Engine: 11.5s - 15.0s (Frames 345 to 450) """
    ease = ease_out_cubic(min(1.0, frame_in_scene / (FPS * 0.8)))

    draw.text((WIDTH // 2 - 400, 80), "ADAPTIVE POMODORO FOCUS ENGINE", fill=(56, 189, 248), font=font_title)
    draw.text((WIDTH // 2 - 380, 150), "Intelligent cognitive workload scheduling with zero academic burnout.", fill=(148, 163, 184), font=font_subtitle)

    # Voice prompt
    draw_rounded_rect(draw, [280, 210, 1640, 280], 16, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
    draw.text((310, 230), '[VOICE] "Alexa, I have 60 minutes tonight, help me study"', fill=(248, 250, 252), font=font_card_title)
    draw.text((1380, 233), "create_study_plan · 60m", fill=(16, 185, 129), font=font_code)

    # Left: Active Circular Countdown Timer
    draw_rounded_rect(draw, [280, 320, 880, 960], 24, fill=(30, 41, 59), outline=(16, 185, 129), width=3)
    draw.text((430, 360), "ACTIVE FOCUS TIMER", fill=(16, 185, 129), font=font_card_title)

    # Circular Timer Ring
    tc_x = 580
    tc_y = 600
    t_radius = 160
    draw.ellipse([tc_x - t_radius, tc_y - t_radius, tc_x + t_radius, tc_y + t_radius], outline=(51, 65, 85), width=18)
    # Animated arc
    angle = (frame_in_scene % 60) / 60.0 * 360.0
    draw.arc([tc_x - t_radius, tc_y - t_radius, tc_x + t_radius, tc_y + t_radius], start=-90, end=-90 + angle, fill=(16, 185, 129), width=18)

    # Digital Time
    mins = 44
    secs = max(0, 59 - int((frame_in_scene * 1.5) % 60))
    time_str = f"{mins}:{secs:02d}"
    draw.text((tc_x - 130, tc_y - 45), time_str, fill=(248, 250, 252), font=font_timer)
    draw.text((tc_x - 145, tc_y + 60), "Sprint 1 of 2: Deep Work", fill=(148, 163, 184), font=font_card_body)

    # Right: Schedule Breakdown
    draw_rounded_rect(draw, [930, 320, 1640, 960], 24, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
    draw.text((970, 360), "Algorithmic Focus Allocation", fill=(248, 250, 252), font=font_card_title)

    blocks = [
        ("Block 1 · 45 Mins Deep Work", "CS 301 · Dynamic Programming & Matrix Chain Multiplication", (56, 189, 248), "IN PROGRESS"),
        ("Block 2 · 15 Mins Restorative Break", "Rest visual focus, hydrate, and stretch away from screen", (16, 185, 129), "UP NEXT"),
        ("Block 3 · Wrap-Up & Retention", "Active recall self-test & automatic session progress logging", (129, 140, 248), "SCHEDULED"),
    ]

    for k, (btitle, bdesc, bcol, status) in enumerate(blocks):
        by = 430 + k * 165
        draw_rounded_rect(draw, [970, by, 1600, by + 135], 16, fill=(15, 23, 42), outline=bcol, width=2)
        draw.text((1000, by + 22), btitle, fill=bcol, font=font_card_title)
        draw_rounded_rect(draw, [1450, by + 20, 1575, by + 55], 8, fill=bcol)
        draw.text((1462, by + 26), status, fill=(15, 23, 42), font=font_badge)
        draw.text((1000, by + 75), bdesc, fill=(226, 232, 240), font=font_card_body)

def render_scene_5(img, draw, frame_in_scene, scene_duration):
    """ Outro & The Pitch: 15.0s - 18.0s (Frames 450 to 540) """
    ease = ease_out_cubic(min(1.0, frame_in_scene / (FPS * 0.8)))

    # Hero Logo & Name
    logo_y = int(220 + (1.0 - ease) * 40)
    draw.text((WIDTH // 2 - 220, logo_y), "STUDYMATE", fill=(248, 250, 252), font=font_hero)
    draw.text((WIDTH // 2 - 470, logo_y + 110), '"Your academic life, organized through conversation."', fill=(56, 189, 248), font=font_title)

    # Value Statement
    draw.text((WIDTH // 2 - 420, logo_y + 210), "An autonomous Alexa+ MCP Add-on & Companion Dashboard.", fill=(148, 163, 184), font=font_subtitle)

    # Badges
    badge_y = logo_y + 320
    badges = [
        ("AMAZON ALEXA+ MCP ADD-ON", (56, 189, 248)),
        ("MODEL CONTEXT PROTOCOL (MCP)", (129, 140, 248)),
        ("100% FREE & OPEN SOURCE", (16, 185, 129)),
    ]
    bx_start = 280
    for b_title, b_col in badges:
        draw_rounded_rect(draw, [bx_start, badge_y, bx_start + 410, badge_y + 60], 14, fill=(30, 41, 59), outline=b_col, width=2)
        draw.text((bx_start + 25, badge_y + 18), b_title, fill=b_col, font=font_badge)
        bx_start += 460

    # Repo Callout
    draw_rounded_rect(draw, [WIDTH // 2 - 380, badge_y + 120, WIDTH // 2 + 380, badge_y + 195], 16, fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    draw.text((WIDTH // 2 - 340, badge_y + 140), "github.com/AlishbaIqbal123/StudyMate", fill=(248, 250, 252), font=font_card_title)

def render_frame(frame_idx):
    img = Image.new("RGB", (WIDTH, HEIGHT), (11, 19, 43))
    draw = ImageDraw.Draw(img)
    draw_background(draw, frame_idx)

    # Timeline bounds
    # S1: 0 - 105 (0 - 3.5s)
    # S2: 105 - 225 (3.5 - 7.5s)
    # S3: 225 - 345 (7.5 - 11.5s)
    # S4: 345 - 450 (11.5 - 15.0s)
    # S5: 450 - 540 (15.0 - 18.0s)

    if frame_idx < 105:
        render_scene_1(img, draw, frame_idx, 105)
    elif frame_idx < 225:
        render_scene_2(img, draw, frame_idx - 105, 120)
    elif frame_idx < 345:
        render_scene_3(img, draw, frame_idx - 225, 120)
    elif frame_idx < 450:
        render_scene_4(img, draw, frame_idx - 345, 105)
    else:
        render_scene_5(img, draw, frame_idx - 450, 90)

    frame_path = os.path.join(WORK_DIR, f"frame_{frame_idx:04d}.png")
    img.save(frame_path, "PNG")

    # Save poster frame at frame 80 (Scene 1 fully revealed hero card)
    if frame_idx == 80:
        img.save(OUTPUT_POSTER, "JPEG", quality=95)
        print(f">> Saved poster frame to {OUTPUT_POSTER}")

def main():
    print(f">> Generating {TOTAL_FRAMES} frames ({TOTAL_SECONDS}s @ {FPS}fps)...")
    for i in range(TOTAL_FRAMES):
        render_frame(i)
        if i % 60 == 0 or i == TOTAL_FRAMES - 1:
            print(f"  -> Rendered frame {i}/{TOTAL_FRAMES} ({(i / TOTAL_FRAMES) * 100:.1f}%)")

    print("\n>> Encoding video with FFmpeg and mixing audio bed...")
    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-r", str(FPS),
        "-i", os.path.join(WORK_DIR, "frame_%04d.png"),
        "-i", MUSIC_TRACK,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-strict", "-2",
        "-b:a", "192k",
        "-t", str(TOTAL_SECONDS),
        "-shortest",
        OUTPUT_VIDEO
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f">> Render complete! Output saved to: {OUTPUT_VIDEO}")

if __name__ == "__main__":
    main()
