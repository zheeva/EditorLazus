export class VisualEffects {
  static applyKenBurns(ctx, canvasWidth, canvasHeight, time, intensity = 0.15) {
    ctx.save();
    const swing = Math.sin(time * 0.7) * intensity * canvasHeight;
    ctx.translate(0, swing);
    ctx.restore();
  }

  static applyTransition(ctx, width, height, transition = 'fade', progress = 0.5) {
    ctx.save();
    if (transition === 'slide') {
      ctx.fillStyle = `rgba(15,23,42,${1 - progress})`;
      ctx.fillRect(0, 0, width, height);
    }
    if (transition === 'zoom') {
      ctx.globalAlpha = 0.5 + (progress * 0.5);
    }
    ctx.restore();
  }
}
