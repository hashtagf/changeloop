export function createAuth(tokens = {}) {
  const unauthorized = () => Object.assign(new Error("UNAUTHORIZED"), { code: "UNAUTHORIZED" });
  return {
    authenticate(header) {
      const match = /^Bearer (\S+)$/.exec(String(header || ""));
      const session = match ? tokens[match[1]] : undefined;
      if (!session || typeof session.userId !== "string" || !session.userId) throw unauthorized();
      return { userId: session.userId, role: session.role === "admin" ? "admin" : "member" };
    }
  };
}
