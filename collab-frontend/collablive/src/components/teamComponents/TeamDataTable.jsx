import React, { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Edit, Image, Pencil, Trash, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ROLE_MAP, STATUS_MAP } from '@/data/general';
import { Badge } from '../ui/badge';

function TeamDataTable({ teamMembers }) {
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    const [loading, setLoading] = useState(false);
    const totalPages = Math.ceil(total / pageSize);
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>

                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : teamMembers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                No records found
                            </TableCell>
                        </TableRow>
                    ) : (
                        teamMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarImage src={member.avatar}>
                                            </AvatarImage>
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className='bg-gray-500 text-center text-white'>
                                        {member.department}
                                    </Badge>
                                    </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_MAP[member.role]?.color || "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {ROLE_MAP[member.role]?.label || "Unknown"}
                                    </span>
                                </TableCell>

                                {/* Status Badge */}
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_MAP[member.status]?.color
                                            }`}
                                    >
                                        {}
                                        {STATUS_MAP[member.status]?.label}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(member.id)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(member.id)}
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
            <Pagination className={'justify-end mt-3'}>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page === 1}
                        />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <PaginationItem key={p}>
                            <PaginationLink
                                onClick={() => setPage(p)}
                                isActive={p === page}
                            >
                                {p}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>


        </div>
    )
}

export default TeamDataTable