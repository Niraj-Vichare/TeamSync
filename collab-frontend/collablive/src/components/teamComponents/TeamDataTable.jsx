import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Pencil, Trash } from 'lucide-react'
import { Button } from '../ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ROLE_MAP, STATUS_MAP } from '@/data/general';
import { Badge } from '../ui/badge';

// ✅ Accept onDelete and onEdit as props
function TeamDataTable({ teamMembers, onDelete, onEdit }) {
    console.log("Rendering TeamDataTable with members:", teamMembers);
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil((teamMembers?.length ?? 0) / pageSize);

    // ✅ Client-side pagination slice
    const paginatedMembers = (teamMembers ?? []).slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    // ✅ Defined locally, delegate to props
    const handleEdit = (member) => {
        onEdit?.(member.memberId, member);
    };

    const handleDelete = (member) => {
        onDelete?.(member.memberId, member);
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedMembers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No records found
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedMembers.map((member) => (
                            <TableRow key={member.profileId ?? member.profile?.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarImage src={member.profileImageUrl} />
                                            <AvatarFallback>
                                                {member.profile?.displayName?.[0] ?? '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{member.profile?.displayName}</div>
                                            <div className="text-sm text-muted-foreground">{member.profile?.email}</div>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge className="bg-muted text-muted-foreground">
                                        {member.departmentDto?.departmentName ?? '—'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_MAP[member?.positionId]?.color ?? "bg-gray-100 text-gray-800"}`}>
                                        {ROLE_MAP[member?.positionId]?.label ?? "Unknown"}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[member.statusId]?.color}`}>
                                        {STATUS_MAP[member.statusId]?.label}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleEdit(member)} // ✅ pass full member
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDelete(member)} // ✅ pass full member
                                        >
                                            <Trash className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination — only show if more than one page */}
            {totalPages > 1 && (
                <Pagination className="justify-end mt-3">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                disabled={page === 1}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <PaginationItem key={p}>
                                <PaginationLink onClick={() => setPage(p)} isActive={p === page}>
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                disabled={page === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}

export default TeamDataTable;