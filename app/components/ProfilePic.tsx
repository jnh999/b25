import Image from "next/image";

interface ProfilePicUser {
  name: string;
  profilePicUrl: string | null;
}

interface ProfilePicProps {
  user: ProfilePicUser;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function ProfilePic({
  user,
  size = "md",
  className = "",
}: ProfilePicProps) {
  const sizeClass = sizeClasses[size];
  if (!user) {
    return null;
  }

  if (user.profilePicUrl) {
    return (
      <div
        className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}
      >
        <Image
          src={`/profile-pics/${user.profilePicUrl}`}
          alt={`${user.name}'s profile picture`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center ${className}`}
    >
      <span className="text-gray-500 font-medium">{user.name.charAt(0)}</span>
    </div>
  );
}
